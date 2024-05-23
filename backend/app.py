from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from datetime import datetime, timedelta
import mysql.connector
import logging
import os

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")  # Inicialize o SocketIO

# Configuração do banco de dados MySQL
db_config = {
    'user': os.getenv('DATABASE_USER', 'root'),
    'password': os.getenv('DATABASE_PASSWORD', 'segunda9'),
    'host': os.getenv('DATABASE_HOST', 'localhost'),
    'database': os.getenv('DATABASE_DB', 'iot_data_db')
}

# Conexão com o banco de dados MySQL
def get_db_connection():
    conn = mysql.connector.connect(**db_config)
    return conn

# Configuração de logging
logging.basicConfig(level=logging.INFO)

# Endpoint para ingestão de dados
@app.route('/data', methods=['POST'])
def ingest_data():
    try:
        data = request.get_json()
        logging.info(f"Received data: {data}")
        tag = data['tag']
        imei = data['imei']
        valor = data['valor']
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        logging.info(f"Processed values: tag={tag}, imei={imei}, valor={valor}, timestamp={timestamp}")

        # Processamento do valor e timesince
        if ';' in valor:
            parts = valor.split(';')
            valor = parts[0]
            timesince = parts[1]
        else:
            timesince = ""

        logging.info(f"Processed timesince: valor={valor}, timesince={timesince}")

        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Inserir os dados reportados
        cursor.execute('INSERT INTO iot_messages (imei, tag, valor, timestamp, timesince) VALUES (%s, %s, %s, %s, %s)',
                       (imei, tag, valor, timestamp, timesince))
        conn.commit()
        cursor.close()
        conn.close()

        # Enviar dados para os clientes conectados via WebSocket
        socketio.emit('new_data', data)

        logging.info(f"Data inserted into DB: IMEI={imei}, Tag={tag}, Valor={valor}, Timestamp={timestamp}, Timesince={timesince}")
        return jsonify({"status": "success"}), 201
    except Exception as e:
        logging.error("Error processing request", exc_info=True)
        return jsonify({"status": "error", "message": str(e)}), 500

# Página inicial
@app.route('/')
def index():
    return render_template('index.html')

# Função para obter dispositivos ativos
def fetch_active_devices():
    cutoff_time = (datetime.now() - timedelta(minutes=30)).strftime('%Y-%m-%d %H:%M:%S')
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('''
        SELECT DISTINCT imei FROM iot_messages WHERE timestamp > %s
    ''', (cutoff_time,))
    devices = cursor.fetchall()
    cursor.close()
    conn.close()
    return devices

@socketio.on('request_active_devices')
def handle_active_devices_request():
    active_devices = fetch_active_devices()
    emit('active_devices', active_devices)

# Endpoint para obter equipamentos inativos
@app.route('/inactive_devices', methods=['GET'])
def inactive_devices():
    now = datetime.now()
    cutoff_inactive = now - timedelta(minutes=30)
    cutoff_warning = now - timedelta(hours=24)
    cutoff_critical = now - timedelta(hours=48)

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('''
        SELECT imei, MAX(timestamp) as last_seen 
        FROM iot_messages 
        GROUP BY imei 
        HAVING MAX(timestamp) < %s
    ''', (cutoff_inactive,))
    all_inactive_devices = cursor.fetchall()
    
    inactive_devices = []
    warning_devices = []
    critical_devices = []

    for device in all_inactive_devices:
        last_seen = device['last_seen']
        time_diff = now - last_seen
        minutes_inactive = time_diff.total_seconds() / 60

        device['minutes_inactive'] = minutes_inactive

        if last_seen < cutoff_critical:
            critical_devices.append(device)
        elif last_seen < cutoff_warning:
            warning_devices.append(device)
        else:
            inactive_devices.append(device)

    cursor.close()
    conn.close()

    return jsonify({
        "inactive": inactive_devices,
        "warning": warning_devices,
        "critical": critical_devices
    })

# Endpoint para obter estado dos equipamentos
@app.route('/device_status', methods=['GET'])
def device_status():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Selecionar apenas as últimas mensagens de cada dispositivo com tag 'poweron' ou 'poweroff'
    cursor.execute('''
        SELECT imei, tag
        FROM iot_messages
        WHERE id IN (
            SELECT MAX(id)
            FROM iot_messages
            WHERE tag IN ('poweron', 'poweroff')
            GROUP BY imei
        )
    ''')
    devices = cursor.fetchall()
    cursor.close()
    conn.close()

    powered_on_devices = [device for device in devices if device['tag'] == 'poweron']
    powered_off_devices = [device for device in devices if device['tag'] == 'poweroff']

    return jsonify({
        "powered_on": powered_on_devices,
        "powered_off": powered_off_devices
    })

# Endpoint para obter o status de um dispositivo específico
@app.route('/device_status/<imei>', methods=['GET'])
def specific_device_status(imei):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('''
        SELECT tag FROM iot_messages WHERE imei = %s ORDER BY timestamp DESC LIMIT 1
    ''', (imei,))
    result = cursor.fetchone()
    cursor.close()
    conn.close()

    if result:
        status = result['tag']
        return jsonify({"imei": imei, "status": status})
    else:
        return jsonify({"error": "Device not found"}), 404

@app.route('/device_failures', methods=['GET'])
def device_failures():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Selecionar apenas as últimas mensagens de cada dispositivo com os erros especificados
    cursor.execute('''
        SELECT imei, valor, timestamp
        FROM iot_messages
        WHERE id IN (
            SELECT MAX(id)
            FROM iot_messages
            WHERE valor LIKE 'errorCode=MEMORY_FAILURE%' OR valor LIKE 'errorCode=BAD_CONFIGURATION%'
            GROUP BY imei
        )
    ''')
    failed_devices = cursor.fetchall()
    cursor.close()
    conn.close()

    # Adicionar sugestões de ações
    for device in failed_devices:
        if "errorCode=MEMORY_FAILURE" in device['valor']:
            device['suggestion'] = "Check memory logs and restart the device if necessary."
        elif "errorCode=BAD_CONFIGURATION" in device['valor']:
            device['suggestion'] = "Open a technical assistance ticket."

    return jsonify(failed_devices)

if __name__ == '__main__':
    socketio.run(app, debug=True)  # Use socketio.run ao invés de app.run
