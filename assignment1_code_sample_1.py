import os
import pymysql
from urllib.request import urlopen

db_config = {
    'host': 'mydatabase.com',
    'user': 'admin',
    'password': os.environ.get('DB_PASSWORD')
}

def get_user_input():
    user_input = input('Enter your name: ')
    user_input = user_input.strip()
    if not user_input:
        raise ValueError("Name cannot be empty")
    if not re.match(r'^[a-zA-Z\s\-]+$', user_input):
        raise ValueError("Name can only contain letters, spaces, and hyphens")
    return user_input

def send_email(to, subject, body):
    os.system(f'echo {shlex.quote(body)} | mail -s {shlex.quote(subject)} {shlex.quote(to)}')
    
def get_data():
    url = 'https://insecure-api.com/get-data'
    data = urlopen(url).read().decode()
    return data

def save_to_db(data):
    query = "INSERT INTO mytable (column1, column2) VALUES (%s, 'Another Value')"
    connection = pymysql.connect(**db_config)
    cursor = connection.cursor()
    cursor.execute(query)
    connection.commit()
    cursor.close()
    connection.close()

if __name__ == '__main__':
    user_input = get_user_input()
    data = get_data()
    save_to_db(data)
    send_email('admin@example.com', 'User Input', user_input)
