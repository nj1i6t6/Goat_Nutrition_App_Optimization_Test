import os
from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()

def create_app():
    # --- 【修改一：配置靜態檔案路徑】 ---
    # 告訴 Flask，我們的靜態檔案（打包後的前端）在哪裡
    # '..' 代表上一層目錄 (backend -> project root)
    # 'frontend/dist' 是 Vite 打包後的輸出目錄
    app = Flask(__name__,
                static_folder=os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'dist'),
                static_url_path='/')

    # --- 配置 ---
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
    
    # --- 【安全性改進：CORS 設定】 ---
    # 根據環境變數決定允許的來源
    cors_origins = os.environ.get('CORS_ORIGINS', '*').split(',')
    if cors_origins == ['*']:
        # 開發環境：允許所有來源
        CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    else:
        # 生產環境：僅允許指定的來源
        CORS(app, resources={r"/api/*": {"origins": cors_origins}}, supports_credentials=True)

    db_user = os.environ.get('DB_USERNAME')
    db_pass = os.environ.get('DB_PASSWORD')
    db_host = os.environ.get('DB_HOST')
    db_port = os.environ.get('DB_PORT')
    db_name = os.environ.get('DB_NAME')
    db_uri = f'postgresql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}'
    app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # --- 初始化擴展 ---
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)

    @login_manager.unauthorized_handler
    def unauthorized():
        from flask import jsonify
        return jsonify(error="Login required"), 401

    with app.app_context():
        # --- 註冊 API 藍圖 ---
        from .api import auth as auth_bp, sheep as sheep_bp, data_management as data_management_bp, agent as agent_bp, dashboard as dashboard_bp
        app.register_blueprint(auth_bp.bp, url_prefix='/api/auth')
        app.register_blueprint(sheep_bp.bp, url_prefix='/api/sheep')
        app.register_blueprint(data_management_bp.bp, url_prefix='/api/data')
        app.register_blueprint(agent_bp.bp, url_prefix='/api/agent')
        app.register_blueprint(dashboard_bp.bp, url_prefix='/api/dashboard')

        # --- 【修改二：添加捕獲所有路由的規則】 ---
        # 這個規則確保，任何不匹配 API 的請求，都會返回前端的 index.html
        # 這是讓 Vue Router (History 模式) 正常工作的關鍵
        @app.route('/', defaults={'path': ''})
        @app.route('/<path:path>')
        def serve(path):
            if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
                return send_from_directory(app.static_folder, path)
            else:
                return send_from_directory(app.static_folder, 'index.html')

        return app