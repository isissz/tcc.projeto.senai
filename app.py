from flask import Flask, render_template
import mysql.connector

from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

db = mysql.connector.connect(
    host='localhost',
    port=3306,
    user='root',
    password='',
    database='SENAI'
)

cursor_setup = db.cursor()
cursor_setup.execute("""
    CREATE TABLE IF NOT EXISTS produtos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        qtde INT NOT NULL,
        descricao TEXT
    )
""")

cursor_setup.execute("SELECT COUNT(*) FROM produtos")
if cursor_setup.fetchone()[0] == 0:
    cursor_setup.execute("INSERT INTO produtos (nome, qtde, descricao) VALUES ('Alicate', 44, 'Uso geral')")
    db.commit() 

cursor_setup.close()


@app.route('/')
def index():
    cursor = db.cursor()
    cursor.execute("SELECT id, nome, qtde, descricao FROM produtos")
    lista_produtos = cursor.fetchall()
    cursor.close()
    return render_template('index.html', produtos=lista_produtos)

@app.route('/home')
def home():
    return render_template('home.html')

@app.route('/cadastro')
def cadastro():
    return render_template('cadastro.html')

@app.route('/move')
def movimentacao():
    return render_template('movimentacao.html')
    
@app.route('/cadastrar', methods=['GET', 'POST'])
def cadastrar_item():
    if request.method == 'POST':
        nome = request.form['nome']
        quantidade = request.form['quantidade']
        descricao = request.form['descricao']
        foto = request.form['foto'] or 'default.jpg'
        
        return redirect(url_for('index'))
        
    return render_template('cadastro.html')

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)