
from flask import Flask, render_template, request, redirect, url_for, jsonify
import mysql.connector

app = Flask(__name__)

# =====================================
# CONEXÃO COM O BANCO DE DADOS
# =====================================

db = mysql.connector.connect(
    host='localhost',
    port=3306,
    user='root',
    password='',
    database='SENAI'
)

# =====================================
# CRIAÇÃO DAS TABELAS
# =====================================

cursor_setup = db.cursor()

cursor_setup.execute("""
    CREATE TABLE IF NOT EXISTS produtos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        qtde INT NOT NULL,
        descricao TEXT,
        estoque_min INT DEFAULT 0,
        preco DECIMAL(10,2) DEFAULT 0,
        foto VARCHAR(255)
    )
""")

cursor_setup.execute("SELECT COUNT(*) FROM produtos")

if cursor_setup.fetchone()[0] == 0:
    cursor_setup.execute("""
        INSERT INTO produtos (nome, qtde, descricao)
        VALUES ('Alicate', 44, 'Uso geral')
    """)
    db.commit()

cursor_setup.close()


# =====================================
# PÁGINA INICIAL
# =====================================

@app.route('/')
def index():
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM produtos")
    lista_produtos = cursor.fetchall()
    cursor.close()

    return render_template('index.html', produtos=lista_produtos)


# =====================================
# HOME
# =====================================

@app.route('/home')
def home():
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM produtos")
    produtos = cursor.fetchall()
    cursor.close()

    return render_template('home.html', produtos=produtos)


# =====================================
# CADASTRO DE PRODUTOS
# =====================================

@app.route('/cadastro')
def cadastro():
    return render_template('cadastro.html')


@app.route('/cadastrar', methods=['POST'])
def cadastrar_item():

    nome = request.form.get('nome', '').strip()
    quantidade = request.form.get('quantidade')
    descricao = request.form.get('descricao', '')
    foto = request.form.get('foto', '')
    estoque_min = request.form.get('estoque_min', 0)
    preco = request.form.get('preco', 0)

    if not nome or quantidade is None:
        return "Preencha os campos obrigatórios!", 400

    try:
        quantidade = int(quantidade)
        estoque_min = int(estoque_min)
        preco = float(preco)

        if quantidade < 0 or estoque_min < 0 or preco < 0:
            return "Os valores não podem ser negativos!", 400

    except ValueError:
        return "Valores inválidos!", 400

    cursor = db.cursor()

    cursor.execute("""
        INSERT INTO produtos
        (nome, qtde, descricao, estoque_min, preco, foto)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (nome, quantidade, descricao, estoque_min, preco, foto))

    db.commit()
    cursor.close()

    return redirect(url_for('home'))


# =====================================
# PÁGINA DE MOVIMENTAÇÃO
# =====================================

@app.route('/move')
def movimentacao():

    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id, nome, qtde FROM produtos")
    produtos = cursor.fetchall()
    cursor.close()

    return render_template('movimentacao.html', produtos=produtos)


# =====================================
# PROCESSAR MOVIMENTAÇÃO DE ESTOQUE
# =====================================

@app.route('/solicitar-movimentacao', methods=['POST'])
def solicitar_movimentacao():

    item_nome = request.form.get('item')
    quantidade = request.form.get('quantidade')
    tipo = request.form.get('tipo')
    finalidade = request.form.get('finalidade', '')

    if not item_nome or not quantidade or not tipo:
        return jsonify({
            "status": "erro",
            "mensagem": "Preencha todos os campos obrigatórios."
        }), 400

    try:
        quantidade = int(quantidade)

        if quantidade <= 0:
            raise ValueError

    except ValueError:
        return jsonify({
            "status": "erro",
            "mensagem": "A quantidade precisa ser um número inteiro maior que zero."
        }), 400

    if tipo not in ['entrada', 'saida']:
        return jsonify({
            "status": "erro",
            "mensagem": "Tipo de movimentação inválido."
        }), 400

    if tipo == 'saida' and not finalidade.strip():
        return jsonify({
            "status": "erro",
            "mensagem": "Informe a finalidade da saída."
        }), 400

    cursor = db.cursor()

    try:
        cursor.execute("""
            SELECT id, qtde FROM produtos
            WHERE nome = %s
            FOR UPDATE
        """, (item_nome,))

        produto = cursor.fetchone()

        if not produto:
            db.rollback()
            return jsonify({
                "status": "erro",
                "mensagem": "Produto não encontrado."
            }), 404

        id_produto = produto[0]
        quantidade_atual = produto[1]

        if tipo == 'entrada':
            nova_quantidade = quantidade_atual + quantidade

        else:
            nova_quantidade = quantidade_atual - quantidade

            if nova_quantidade < 0:
                db.rollback()
                return jsonify({
                    "status": "erro",
                    "mensagem": "Estoque insuficiente!"
                }), 400

        cursor.execute("""
            UPDATE produtos
            SET qtde = %s
            WHERE id = %s
        """, (nova_quantidade, id_produto))

        db.commit()

        return jsonify({
            "status": "sucesso",
            "mensagem": "Movimentação registrada com sucesso!",
            "item": item_nome,
            "tipo": tipo,
            "quantidade_movimentada": quantidade,
            "finalidade": finalidade,
            "novo_saldo": nova_quantidade
        }), 200

    except mysql.connector.Error:
        db.rollback()
        app.logger.exception("Erro na movimentação")
        return jsonify({
            "status": "erro",
            "mensagem": "Erro ao atualizar o estoque."
        }), 500

    finally:
        cursor.close()


# =====================================
# API - LISTAR PRODUTOS
# =====================================

@app.route('/api/produtos', methods=['GET'])
def api_listar_produtos():

    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM produtos")

    produtos = cursor.fetchall()
    cursor.close()

    return jsonify(produtos), 200


# =====================================
# API - CADASTRAR PRODUTO
# =====================================

@app.route('/api/produtos', methods=['POST'])
def api_cadastrar_produto():

    dados = request.get_json(silent=True)

    if not isinstance(dados, dict):
        return jsonify({"erro": "JSON inválido ou ausente"}), 400

    nome = dados.get('nome')
    quantidade = dados.get('quantidade')
    descricao = dados.get('descricao', '')
    estoque_min = dados.get('estoque_min', 0)
    preco = dados.get('preco', 0)
    foto = dados.get('foto', '')

    if not isinstance(nome, str) or not nome.strip() or quantidade is None:
        return jsonify({
            "erro": "Nome e quantidade são obrigatórios."
        }), 400

    try:
        quantidade = int(quantidade)
        estoque_min = int(estoque_min)
        preco = float(preco)

        if quantidade < 0 or estoque_min < 0 or preco < 0:
            raise ValueError

    except (ValueError, TypeError):
        return jsonify({"erro": "Valores numéricos inválidos."}), 400

    cursor = db.cursor()

    try:
        cursor.execute("""
            INSERT INTO produtos
            (nome, qtde, descricao, estoque_min, preco, foto)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            nome.strip(),
            quantidade,
            descricao,
            estoque_min,
            preco,
            foto
        ))

        db.commit()
        novo_id = cursor.lastrowid

        return jsonify({
            "status": "sucesso",
            "id": novo_id,
            "mensagem": "Produto cadastrado!"
        }), 201

    except mysql.connector.Error:
        db.rollback()
        return jsonify({"erro": "Erro ao cadastrar produto."}), 500

    finally:
        cursor.close()


# =====================================
# INICIAR SERVIDOR
# =====================================

if __name__ == '__main__':
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000
    )
