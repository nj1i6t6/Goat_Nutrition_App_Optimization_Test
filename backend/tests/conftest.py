"""
測試配置和共用 fixtures
"""

import pytest
import tempfile
import os
from app import create_app, db
from app.models import User, Sheep, SheepEvent
from werkzeug.security import generate_password_hash


@pytest.fixture
def app():
    """創建測試應用實例"""
    # 創建臨時資料庫文件
    db_fd, db_path = tempfile.mkstemp()
    
    # 設置測試配置
    app = create_app()
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': f'sqlite:///{db_path}',
        'WTF_CSRF_ENABLED': False,
        'SECRET_KEY': 'test-secret-key'
    })
    
    with app.app_context():
        db.create_all()
        yield app
        
    # 清理
    os.close(db_fd)
    os.unlink(db_path)


@pytest.fixture
def client(app):
    """創建測試客戶端"""
    return app.test_client()


@pytest.fixture
def runner(app):
    """創建測試命令行運行器"""
    return app.test_cli_runner()


@pytest.fixture
def test_user(app):
    """創建測試用戶"""
    with app.app_context():
        user = User(
            username='testuser',
            password_hash=generate_password_hash('testpass')
        )
        db.session.add(user)
        db.session.commit()
        return user


@pytest.fixture
def authenticated_client(client, test_user):
    """創建已認證的測試客戶端"""
    # 登入測試用戶
    client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'testpass'
    })
    return client


@pytest.fixture
def test_sheep_data():
    """測試羊隻資料"""
    return {
        'EarNum': 'TEST001',
        'Breed': '波爾羊',
        'Sex': '母',
        'BirthDate': '2023-01-15',
        'Body_Weight_kg': 45.5,
        'Age_Months': 12,
        'status': '懷孕',
        'FarmNum': 'F001'
    }


@pytest.fixture
def test_sheep(app, test_user, test_sheep_data):
    """創建測試羊隻"""
    with app.app_context():
        sheep = Sheep(user_id=test_user.id, **test_sheep_data)
        db.session.add(sheep)
        db.session.commit()
        return sheep


@pytest.fixture
def multiple_test_sheep(app, test_user):
    """創建多隻測試羊隻"""
    with app.app_context():
        sheep_data = [
            {
                'EarNum': 'A001',
                'Breed': '波爾羊',
                'Sex': '母',
                'Body_Weight_kg': 45.0,
                'FarmNum': 'F001'
            },
            {
                'EarNum': 'A002', 
                'Breed': '台灣黑山羊',
                'Sex': '公',
                'Body_Weight_kg': 55.0,
                'FarmNum': 'F001'
            },
            {
                'EarNum': 'B001',
                'Breed': '努比亞羊',
                'Sex': '母',
                'Body_Weight_kg': 40.0,
                'FarmNum': 'F002'
            }
        ]
        
        sheep_list = []
        for data in sheep_data:
            sheep = Sheep(user_id=test_user.id, **data)
            db.session.add(sheep)
            sheep_list.append(sheep)
        
        db.session.commit()
        return sheep_list


@pytest.fixture
def mock_gemini_api(monkeypatch):
    """模擬 Gemini API 調用"""
    def mock_call_gemini_api(prompt, api_key, generation_config_override=None):
        return {
            "text": "這是模擬的 AI 回應內容。根據您提供的羊隻資料，建議每日飼料需求如下：\n\n- DMI: 1.2-1.5 kg/day\n- ME: 8.5-9.5 MJ/day\n- CP: 120-140 g/day"
        }
    
    monkeypatch.setattr('app.utils.call_gemini_api', mock_call_gemini_api)
    return mock_call_gemini_api


@pytest.fixture
def mock_gemini_api_error(monkeypatch):
    """模擬 Gemini API 錯誤"""
    def mock_call_gemini_api_error(prompt, api_key, generation_config_override=None):
        return {"error": "API 調用失敗"}
    
    monkeypatch.setattr('app.utils.call_gemini_api', mock_call_gemini_api_error)
    return mock_call_gemini_api_error
