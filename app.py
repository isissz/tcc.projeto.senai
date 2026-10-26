from flask import Flask, render_template, request, redirect, url_for, jsonify, abort
import mysql.connector
import bcrypt
import time


app = Flask(__name__)

# --- CONFIGURAÇÃO E INICIALIZAÇÃO DO BANCO DE DADOS ---
db = mysql.connector.connect(
    host='db',
    port=3306,
    user='root',
    password='mysql_root',
    database='senai'
)

cursor_setup = db.cursor()

cursor_setup.execute("""
    CREATE TABLE IF NOT EXISTS produtos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        quantidade INT NOT NULL,
        descricao TEXT,
        estoque_min INT,
        preco DECIMAL(10,2),
        foto VARCHAR(255)
    )
""")

cursor_setup.execute("""
    CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        permissao VARCHAR(50)
    )
""")

# Popula o banco com um item inicial caso esteja vazio
cursor_setup.execute("SELECT COUNT(*) FROM produtos")
if cursor_setup.fetchone()[0] == 0:
    cursor_setup.execute("INSERT INTO produtos (nome, quantidade, descricao) VALUES ('Alicate', 44, 'Uso geral')")
    db.commit() 

cursor_setup.close()


# --- ROTAS DA APLICAÇÃO ---

# 1. Página Inicial / Login
@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')


# 2. Processamento do Login
@app.route('/login', methods=['POST'])
def efetuar_login():
    nome_digitado = request.form.get('nome', '').strip()
    senha_digitada = request.form.get('senha', '')

    cursor = db.cursor()
    sql = "SELECT senha, permissao FROM usuarios WHERE nome = %s"
    cursor.execute(sql, (nome_digitado,))
    resultado = cursor.fetchone()
    cursor.close()

    # Aviso: usuário não encontrado
    if not resultado:
        return """
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f9;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            .card {
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 400px;
                width: 85%;
            }
            h2 {
                color: #192a6b;
                margin-bottom: 10px;
            }
            p {
                color: #555;
                margin-bottom: 20px;
            }
            a {
                display: inline-block;
                background: #192a6b;
                color: white;
                padding: 10px 20px;
                border-radius: 4px;
                text-decoration: none;
            }
            a:hover {
                background: #e65c17;
            }
        </style>

        <div class="card">
            <h2>Usuário não encontrado!</h2>
            <p>Confira o nome de usuário digitado e tente novamente.</p>
            <a href="/">Voltar ao login</a>
        </div>
        """, 404

    # Recupera os dados do banco
    senha_banco = resultado[0]
    permissao_banco = resultado[1]

    # Garante que a senha armazenada seja bytes
    if isinstance(senha_banco, str):
        senha_banco = senha_banco.encode('utf-8')

    # Verifica a senha
    try:
        senha_correta = bcrypt.checkpw(
            senha_digitada.encode('utf-8'),
            senha_banco
        )
    except (ValueError, TypeError):
        return "Erro ao verificar a senha armazenada.", 500

    if not senha_correta:
        return """
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f9;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            .card {
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 400px;
                width: 85%;
            }
            h2 {
                color: #192a6b;
                margin-bottom: 10px;
            }
            p {
                color: #555;
                margin-bottom: 20px;
            }
            a {
                display: inline-block;
                background: #192a6b;
                color: white;
                padding: 10px 20px;
                border-radius: 4px;
                text-decoration: none;
            }
            a:hover {
                background: #e65c17;
            }
        </style>

        <div class="card">
            <h2>Senha incorreta!</h2>
            <p>Verifique sua senha e tente novamente.</p>
            <a href="/">Voltar ao login</a>
        </div>
        """, 401

    # Redireciona conforme a permissão
    if permissao_banco and permissao_banco.strip().lower() == 'admin':
        return redirect(url_for('cadastro'))

    return redirect(url_for('home'))


# 3. Dashboard / Painel de Produtos
@app.route('/home', methods=['GET', 'POST'])
def home():
    cursor = db.cursor()
    cursor.execute("SELECT * FROM produtos")
    lista_produtos = cursor.fetchall()
    cursor.close()
    return render_template('home.html', produtos=lista_produtos)


# 4. Acesso à Página de Cadastro de Produtos (Apenas Admin) - AJUSTADO para GET/POST para melhor navegação
@app.route('/cadastro', methods=['GET', 'POST'])
def cadastro():
    if request.method == 'POST':
        nome_digitado = request.form.get('nome')
        senha_digitada = request.form.get('senha')

        cursor = db.cursor()
        sql = "SELECT senha, permissao FROM usuarios WHERE nome = %s"
        cursor.execute(sql, (nome_digitado,))
        resultado = cursor.fetchone()
        cursor.close()

        # Modelo padrão de CSS para reutilizar nos erros
        estilo_erro = """
            <style>
                body { font-family: Arial, sans-serif; background-color: #f4f4f9; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .card { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); text-align: center; max-width: 400px; width: 100%; }
                h2 { color: #ff6d24; margin-bottom: 10px; }
                p { color: #555; margin-bottom: 20px; }
                a { display: inline-block; background: #007bff; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; }
                a:hover { background: #0056b3; }
            </style>
        """

        if resultado:
            senha_banco = resultado[0]
            permissao_banco = resultado[1]

            if permissao_banco != 'admin':
                html = f"""
                    {estilo_erro}
                    <div class="card">
                        <h2>Acesso Negado</h2>
                        <p>Usuário sem permissão de administrador.</p>
                        <a href="/">Voltar</a>
                    </div>
                """
                return html, 403
            
            if bcrypt.checkpw(senha_digitada.encode('utf-8'), senha_banco.encode('utf-8')):
                return render_template('cadastro.html')
            else:
                html = f"""
                    {estilo_erro}
                    <div class="card">
                        <h2>Erro de Autenticação</h2>
                        <p>Senha incorreta!</p>
                        <a href="/">Tentar novamente</a>
                    </div>
                """
                return html, 401
        else:
            html = f"""
                {estilo_erro}
                <div class="card">
                    <h2>Não Encontrado</h2>
                    <p>Usuário não encontrado!</p>
                    <a href="/">Voltar</a>
                </div>
            """
            return html, 404
            
    return render_template('cadastro.html')

# 5. Salvar Novo Item Cadastrado
@app.route('/cadastrar', methods=['POST', 'GET']) 
def cadastrar_item():
    nome = request.form['nome']
    quantidade = request.form['qtde']
    descricao = request.form['descricao']
    estoque_min = request.form['estoque_min']
    preco = request.form['preco']
    foto = request.form['foto']
    
    cursor = db.cursor()
    comando_sql = "INSERT INTO produtos (nome, quantidade, descricao, estoque_min, preco, foto) VALUES (%s, %s, %s, %s, %s, %s)"
    dados = (nome, quantidade, descricao, estoque_min, preco, foto)

    cursor.execute(comando_sql, dados)
    db.commit()
    cursor.close()
    
    return redirect(url_for('home'))


# 6. Movimentações de Estoque (Página)
@app.route('/move')
def movimentacao():
    return render_template('movimentacao.html')


# 7. Processar Entrada / Saída de Item
@app.route('/solicitar-movimentacao', methods=['POST', 'GET'])
def solicitar_movimentacao():
    item_nome = request.form.get('item')
    quantidade_movida = int(request.form.get('quantidade'))
    tipo = request.form.get('tipo')

    cursor = db.cursor()
    cursor.execute("SELECT id, quantidade FROM produtos WHERE nome = %s", (item_nome,))
    produto = cursor.fetchone()

    if not produto:
        cursor.close()
        return jsonify({
            "status": "erro",
            "mensagem": f"O item '{item_nome}' não foi encontrado no banco de dados."
        }), 404

    id_produto = produto[0]
    quantidade_atual = produto[1]

    if tipo == 'entrada':
        nova_quantidade = quantidade_atual + quantidade_movida
    elif tipo == 'saida':
        nova_quantidade = quantidade_atual - quantidade_movida
        if nova_quantidade < 0:
            cursor.close()
            return jsonify({
                "status": "erro",
                "mensagem": f"Saldo insuficiente! Estoque atual de {item_nome}: {quantidade_atual} unidades."
            }), 400
    else:
        cursor.close()
        return jsonify({"status": "erro", "mensagem": "Tipo de movimentação inválido."}), 400

    cursor.execute("UPDATE produtos SET quantidade = %s WHERE id = %s", (nova_quantidade, id_produto))
    db.commit()
    cursor.close()

    return jsonify({
        "status": "sucesso",
        "mensagem": f"Movimentação de {tipo} para o item '{item_nome}' gravada! Novo saldo: {nova_quantidade} unidades."
    })


# 8. Criação de Novos Usuários - CORRIGIDO e ISOLADO
@app.route('/usuarios', methods=['GET', 'POST'])
def usuarios():
    if request.method == 'POST':
        nome = request.form.get('nome', '').strip()
        senha_limpa = request.form.get('senha', '')
        permissao = request.form.get('permissao')

        # VALIDAÇÃO DE SEGURANÇA NO BACK-END:
        if not nome or not senha_limpa or not permissao:
            return "Erro: Todos os campos (nome, senha e permissão) são obrigatórios!", 400

        if len(senha_limpa) < 8:
            return "Erro: A senha precisa ter no mínimo 8 caracteres!", 400

        salt = bcrypt.gensalt() 
        senha_criptografada = bcrypt.hashpw(senha_limpa.encode('utf-8'), salt).decode('utf-8')

        cursor = db.cursor()
        try:
            sql = "INSERT INTO usuarios (nome, senha, permissao) VALUES (%s, %s, %s)"
            cursor.execute(sql, (nome, senha_criptografada, permissao))
            db.commit()
            cursor.close()
            return redirect(url_for('index')) 
        except mysql.connector.Error as err:
            cursor.close()
            return f"Erro ao cadastrar (Usuário já existe?): {err}", 400

    return render_template('usuarios.html')







# 9. Exclusão de Produtos (Via requisição assíncrona/Fetch API)
@app.route('/excluir/<int:id>', methods=['DELETE'])
def excluir_produto(id):
    cursor = db.cursor()
    cursor.execute("DELETE FROM produtos WHERE id = %s", (id,))
    db.commit()
    cursor.close()
    return jsonify({"success": True}), 200


######################## rotas api


@app.route('/api/login', methods=['POST'])
def api_login():
    cursor = None

    try:
        # Verifica se o corpo da requisição contém JSON
        dados = request.get_json(silent=True)

        if not isinstance(dados, dict):
            return jsonify({
                "status": "erro",
                "erro": "JSON inválido ou ausente"
            }), 400

        nome = dados.get('nome')
        senha_limpa = dados.get('senha')

        if not isinstance(nome, str) or not nome.strip():
            return jsonify({
                "status": "erro",
                "erro": "O campo 'nome' é obrigatório"
            }), 400

        if not isinstance(senha_limpa, str) or not senha_limpa:
            return jsonify({
                "status": "erro",
                "erro": "O campo 'senha' é obrigatório"
            }), 400

        nome = nome.strip()

        # Busca o usuário no banco de dados
        cursor = db.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT id, nome, senha, permissao
            FROM usuarios
            WHERE nome = %s
            """,
            (nome,)
        )

        usuario = cursor.fetchone()

        # Verifica se o usuário existe
        if not usuario:
            return jsonify({
                "status": "erro",
                "erro": "Usuário ou senha incorretos"
            }), 401

        # Confere se o hash armazenado é válido para bcrypt
        hash_senha = usuario.get('senha')

        if not isinstance(hash_senha, (str, bytes)):
            return jsonify({
                "status": "erro",
                "erro": "Não foi possível validar as credenciais"
            }), 500

        if isinstance(hash_senha, str):
            hash_senha = hash_senha.encode('utf-8')

        senha_bytes = senha_limpa.encode('utf-8')

        try:
            senha_valida = bcrypt.checkpw(senha_bytes, hash_senha)
        except (ValueError, TypeError):
            app.logger.exception("Hash bcrypt inválido para o usuário")
            return jsonify({
                "status": "erro",
                "erro": "Não foi possível validar as credenciais"
            }), 500

        if not senha_valida:
            return jsonify({
                "status": "erro",
                "erro": "Usuário ou senha incorretos"
            }), 401

        # Login validado
        return jsonify({
            "status": "sucesso",
            "mensagem": "Login realizado!",
            "id": usuario['id'],
            "permissao": usuario['permissao']
        }), 200

    except Exception:
        app.logger.exception("Erro interno durante o login")

        return jsonify({
            "status": "erro",
            "erro": "Erro interno ao processar o login"
        }), 500

    finally:
        if cursor is not None:
            try:
                cursor.close()
            except Exception:
                app.logger.exception("Erro ao fechar o cursor do banco")




@app.route('/api/usuarios', methods=['GET'])
def api_listar_usuarios():
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id, nome, permissao FROM usuarios")
    usuarios = cursor.fetchall()
    cursor.close()
    return jsonify(usuarios), 200


@app.route('/api/usuarios/<int:id>', methods=['GET'])
def api_obter_usuario(id):
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id, nome, permissao FROM usuarios WHERE id = %s", (id,))
    usuario = cursor.fetchone()
    cursor.close()
    if usuario:
        return jsonify(usuario), 200
    return jsonify({"erro": "Usuário não encontrado"}), 404


@app.route('/api/usuarios', methods=['POST'])
def api_cadastrar_usuario():
    dados = request.get_json()
    if not dados:
        return jsonify({"erro": "JSON inválido ou ausente"}), 400
    
    nome = dados.get('nome')
    senha_limpa = dados.get('senha')
    permissao = dados.get('permissao', 'comum')

    if not nome or not senha_limpa:
        return jsonify({"erro": "Campos 'nome' e 'senha' são obrigatórios"}), 400

    salt = bcrypt.gensalt()
    senha_criptografada = bcrypt.hashpw(senha_limpa.encode('utf-8'), salt).decode('utf-8')

    cursor = db.cursor()
    try:
        sql = "INSERT INTO usuarios (nome, senha, permissao) VALUES (%s, %s, %s)"
        cursor.execute(sql, (nome, senha_criptografada, permissao))
        db.commit()
        novo_id = cursor.lastrowid
        cursor.close()
        return jsonify({"status": "sucesso", "id": novo_id, "mensagem": "Usuário cadastrado!"}), 201
    except mysql.connector.Error as err:
        cursor.close()
        return jsonify({"erro": f"Erro ao cadastrar usuário: {err}"}), 400


@app.route('/api/usuarios/<int:id>', methods=['PUT'])
def api_atualizar_usuario(id):
    dados = request.get_json()
    if not dados:
        return jsonify({"erro": "JSON inválido ou ausente"}), 400

    cursor = db.cursor()
    cursor.execute("SELECT id FROM usuarios WHERE id = %s", (id,))
    if not cursor.fetchone():
        cursor.close()
        return jsonify({"erro": "Usuário não encontrado"}), 404

    nome = dados.get('nome')
    senha_limpa = dados.get('senha')
    permissao = dados.get('permissao')

    if senha_limpa:
        salt = bcrypt.gensalt()
        senha_criptografada = bcrypt.hashpw(senha_limpa.encode('utf-8'), salt).decode('utf-8')
        sql = """
            UPDATE usuarios 
            SET nome = COALESCE(%s, nome),
                senha = %s,
                permissao = COALESCE(%s, permissao)
            WHERE id = %s
        """
        cursor.execute(sql, (nome, senha_criptografada, permissao, id))
    else:
        sql = """
            UPDATE usuarios 
            SET nome = COALESCE(%s, nome),
                permissao = COALESCE(%s, permissao)
            WHERE id = %s
        """
        cursor.execute(sql, (nome, permissao, id))

    db.commit()
    cursor.close()
    return jsonify({"status": "sucesso", "mensagem": "Usuário atualizado!"}), 200


@app.route('/api/usuarios/<int:id>', methods=['DELETE'])
def api_deletar_usuario(id):
    cursor = db.cursor()
    cursor.execute("DELETE FROM usuarios WHERE id = %s", (id,))
    linhas = cursor.rowcount
    db.commit()
    cursor.close()

    if linhas == 0:
        return jsonify({"erro": "Usuário não encontrado"}), 404
        
    return jsonify({"status": "sucesso", "mensagem": "Usuário excluído!"}), 200

@app.route('/api/produtos', methods=['GET'])
def api_listar_produtos():
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM produtos")
    produtos = cursor.fetchall()
    cursor.close()
    return jsonify(produtos), 200


@app.route('/api/produtos/<int:id>', methods=['GET'])
def api_obter_produto(id):
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM produtos WHERE id = %s", (id,))
    produto = cursor.fetchone()
    cursor.close()
    if produto:
        return jsonify(produto), 200
    return jsonify({"erro": "Produto não encontrado"}), 404


@app.route('/api/produtos', methods=['POST'])
def api_cadastrar_produto():
    dados = request.get_json()
    if not dados:
        return jsonify({"erro": "JSON inválido ou ausente"}), 400
    
    nome = dados.get('nome')
    quantidade = dados.get('quantidade')
    descricao = dados.get('descricao', '')
    estoque_min = dados.get('estoque_min', 0)
    preco = dados.get('preco', 0.0)
    foto = dados.get('foto', '')

    if not nome or quantidade is None:
        return jsonify({"erro": "Campos 'nome' e 'quantidade' são obrigatórios"}), 400

    cursor = db.cursor()
    sql = "INSERT INTO produtos (nome, quantidade, descricao, estoque_min, preco, foto) VALUES (%s, %s, %s, %s, %s, %s)"
    cursor.execute(sql, (nome, quantidade, descricao, estoque_min, preco, foto))
    db.commit()
    novo_id = cursor.lastrowid
    cursor.close()

    return jsonify({"status": "sucesso", "id": novo_id}), 201


@app.route('/api/produtos/<int:id>', methods=['PUT'])
def api_atualizar_produto(id):
    dados = request.get_json()
    if not dados:
        return jsonify({"erro": "JSON inválido ou ausente"}), 400

    cursor = db.cursor()
    cursor.execute("SELECT id FROM produtos WHERE id = %s", (id,))
    if not cursor.fetchone():
        cursor.close()
        return jsonify({"erro": "Produto não encontrado"}), 404

    sql = """
        UPDATE produtos 
        SET nome = COALESCE(%s, nome),
            quantidade = COALESCE(%s, quantidade),
            descricao = COALESCE(%s, descricao),
            estoque_min = COALESCE(%s, estoque_min),
            preco = COALESCE(%s, preco),
            foto = COALESCE(%s, foto)
        WHERE id = %s
    """
    cursor.execute(sql, (
        dados.get('nome'), dados.get('quantidade'), dados.get('descricao'),
        dados.get('estoque_min'), dados.get('preco'), dados.get('foto'), id
    ))
    db.commit()
    cursor.close()

    return jsonify({"status": "sucesso", "mensagem": "Produto atualizado!"}), 200


@app.route('/api/produtos/<int:id>', methods=['DELETE'])
def api_deletar_produto(id):
    cursor = db.cursor()
    cursor.execute("DELETE FROM produtos WHERE id = %s", (id,))
    linhas = cursor.rowcount
    db.commit()
    cursor.close()

    if linhas == 0:
        return jsonify({"erro": "Produto não encontrado"}), 404
        
    return jsonify({"status": "sucesso", "mensagem": "Produto excluído!"}), 200


# --- API DE MOVIMENTAÇÃO DE ESTOQUE ---

@app.route('/api/movimentacao', methods=['POST'])
def api_movimentacao():
    dados = request.get_json()
    
    if not dados:
        return jsonify({"erro": "Corpo da requisição JSON inválido ou ausente"}), 400

    item_nome = dados.get('item')
    quantidade_movida = dados.get('quantidade')
    tipo = dados.get('tipo') # 'entrada' ou 'saida'

    # Validação dos campos obrigatórios
    if not item_nome or quantidade_movida is None or not tipo:
        return jsonify({
            "erro": "Os campos 'item' (nome), 'quantidade' e 'tipo' são obrigatórios"
        }), 400

    try:
        quantidade_movida = int(quantidade_movida)
    except ValueError:
        return jsonify({"erro": "O campo 'quantidade' deve ser um número inteiro"}), 400

    cursor = db.cursor()
    cursor.execute("SELECT id, quantidade FROM produtos WHERE nome = %s", (item_nome,))
    produto = cursor.fetchone()

    if not produto:
        cursor.close()
        return jsonify({
            "status": "erro",
            "mensagem": f"O item '{item_nome}' não foi encontrado no banco de dados."
        }), 404

    id_produto = produto[0]
    quantidade_atual = produto[1]

    # Lógica de cálculo de estoque
    if tipo == 'entrada':
        nova_quantidade = quantidade_atual + quantidade_movida
    elif tipo == 'saida':
        nova_quantidade = quantidade_atual - quantidade_movida
        if nova_quantidade < 0:
            cursor.close()
            return jsonify({
                "status": "erro",
                "mensagem": f"Saldo insuficiente! Estoque atual de '{item_nome}': {quantidade_atual} unidades."
            }), 400
    else:
        cursor.close()
        return jsonify({
            "status": "erro", 
            "mensagem": "Tipo de movimentação inválido. Utilize 'entrada' ou 'saida'."
        }), 400

    # Atualiza o banco de dados
    cursor.execute("UPDATE produtos SET quantidade = %s WHERE id = %s", (nova_quantidade, id_produto))
    db.commit()
    cursor.close()

    return jsonify({
        "status": "sucesso",
        "mensagem": f"Movimentação de {tipo} gravada com sucesso!",
        "item": item_nome,
        "quantidade_movimentada": quantidade_movida,
        "novo_saldo": nova_quantidade
    }), 200
    
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)