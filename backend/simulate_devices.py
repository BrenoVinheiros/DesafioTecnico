import requests
import random
import time
import threading
from datetime import datetime, timedelta
import mysql.connector
import os

# Configuração do banco de dados MySQL
db_config = {
    'user': os.getenv('DATABASE_USER', 'root'),
    'password': os.getenv('DATABASE_PASSWORD', 'segunda9'),
    'host': os.getenv('DATABASE_HOST', 'mysql'),  # Nome do serviço MySQL no docker-compose
    'database': os.getenv('DATABASE_DB', 'iot_data_db')
}

# URL da API para ingestão de dados
API_URL = 'http://backend:5000/data'

# Lista de IMEIs dos dispositivos
IMEI_LIST = [f'{i:015d}' for i in range(100000000000001, 100000000001001)]

# Dicionário para manter o status de cada dispositivo
device_status = {imei: True for imei in IMEI_LIST}

# Dicionário para manter o último código de erro de cada dispositivo
device_error_code = {imei: 'NO_ERROR' for imei in IMEI_LIST}

# Conexão com o banco de dados MySQL
def get_db_connection():
    conn = mysql.connector.connect(**db_config)
    return conn

# Função para inserir dados históricos
def insert_historical_data():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Gerar dados históricos para cada dispositivo
    for imei in IMEI_LIST:
        # Simular o histórico de dados para 2 dias
        for day in range(0, 3)[::-1]:
            minutes_offset = random.randint(0, 33)  # Reduzir entre 0 e 30 minutos
            timestamp = datetime.now() - timedelta(days=day, minutes=minutes_offset)
            if device_status[imei]:  # Verificar se o dispositivo ainda está ativo
                for _ in range(1):  # Inserir 1 registros por dia
                    event = random.choice(['poweron', 'poweroff', 'timebased'])
                    if event == 'timebased':
                        error_code = random.choices(
                            ['NO_ERROR', 'BAD_CONFIGURATION', 'MEMORY_FAILURE'],
                            weights=[99, 0.5, 0.5],
                            k=1
                        )[0]
                        time_since_last_power_on = random.randint(0, 5000)
                        valor = f"errorCode={error_code}"
                        timesince = f"timeSinceLastPowerOnMinutes={time_since_last_power_on}"
                    else:
                        valor = "1"
                        timesince = ""
                    cursor.execute('INSERT INTO iot_messages (imei, tag, valor, timestamp, timesince) VALUES (%s, %s, %s, %s, %s)',
                                   (imei, event, valor, timestamp.strftime('%Y-%m-%d %H:%M:%S'), timesince))

                    # Determinar se o dispositivo se tornará inativo
                    if random.random() < 0.002:  # 0.2% de chance de se tornar inativo
                        print(f"Device {imei} became inactive on {timestamp.strftime('%Y-%m-%d %H:%M:%S')}")
                        device_status[imei] = False
                        break  # Sair do loop de inserção de eventos

    conn.commit()
    cursor.close()
    conn.close()
    print("Historical data inserted successfully.")

# Função para enviar dados para a API
def send_data(tag, imei, valor):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    data = {
        'tag': tag,
        'imei': imei,
        'valor': str(valor),  # Convertemos valor para string
        'timestamp': timestamp
    }
    try:
        response = requests.post(API_URL, json=data)
        response.raise_for_status()  # Raise an error for bad status codes
        print(f"Data sent successfully: {data}")
    except requests.exceptions.RequestException as e:
        print(f"Failed to send data: {data}, error: {e}")

# Função para simular o envio de dados timebased
def send_timebased_data(imei):
    while device_status[imei]:
        # Manter o último código de erro, se não for NO_ERROR
        if device_error_code[imei] in ['BAD_CONFIGURATION', 'MEMORY_FAILURE']:
            error_code = device_error_code[imei]
        else:
            # Definindo probabilidades para os códigos de erro
            error_code = random.choices(
                ['NO_ERROR', 'BAD_CONFIGURATION', 'MEMORY_FAILURE'],
                weights=[99, 0.5, 0.5],  # Probabilidades: 99% para NO_ERROR, 0.5% para os outros
                k=1
            )[0]
            device_error_code[imei] = error_code
        
        time_since_last_power_on = random.randint(0, 5000)
        valor = f"errorCode={error_code};timeSinceLastPowerOnMinutes={time_since_last_power_on}"
        send_data('timebased', imei, valor)
        time.sleep(30)  # Intervalo aleatório entre 10 e 30 segundos
        # Determinar se o dispositivo se tornará inativo
        if random.random() < 0.001:  # 0.1% de chance de se tornar inativo
            print(f"Device {imei} became inactive")
            device_status[imei] = False

# Função para simular o envio de dados de poweron/poweroff
def simulate_power_cycle(imei):
    while device_status[imei]:
        # Simular o envio de dados de poweron/poweroff
        power_event = random.choice(['poweron', 'poweroff'])
        send_data(power_event, imei, "1")  # Enviando como string
        # Esperar um tempo aleatório entre 20 segundos e 2 minutos
        time.sleep(random.uniform(20, 120))
        # Determinar se o dispositivo se tornará inativo
        if random.random() < 0.001:  # 0.1% de chance de se tornar inativo
            print(f"Device {imei} became inactive")
            device_status[imei] = False

# Função para simular um dispositivo
def simulate_device(imei):
    # Iniciar thread para envio de dados timebased
    timebased_thread = threading.Thread(target=send_timebased_data, args=(imei,))
    timebased_thread.start()

    # Iniciar thread para envio de dados de poweron/poweroff
    power_cycle_thread = threading.Thread(target=simulate_power_cycle, args=(imei,))
    power_cycle_thread.start()

    # Aguardar a conclusão das threads
    timebased_thread.join()
    power_cycle_thread.join()

# Função para controlar a taxa de envio e limitar o número de dispositivos que enviam dados
def control_simulation_rate():
    while True:
        active_devices = random.sample(IMEI_LIST, k=min(10, len(IMEI_LIST)))  # Selecionar até 10 dispositivos
        for imei in active_devices:
            if device_status[imei]:
                thread = threading.Thread(target=simulate_device, args=(imei,))
                thread.start()
        time.sleep(30)  # Aguardar 30 segundos antes de iniciar outro lote de dispositivos

# Função principal para popular o banco de dados e iniciar a simulação
def main():
    # Inserir dados históricos
    insert_historical_data()
    
    # Iniciar a taxa de controle de simulação
    control_thread = threading.Thread(target=control_simulation_rate)
    control_thread.start()
    control_thread.join()

    print("Simulation complete.")

if __name__ == "__main__":
    main()
