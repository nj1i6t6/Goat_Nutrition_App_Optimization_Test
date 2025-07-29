"""
agent.py API 測試
測試 AI 代理人相關的 API 端點
"""

import pytest
import json
from unittest.mock import patch, MagicMock
from app.models import ChatHistory


class TestAgentAPI:
    """Agent API 測試類別"""

    def test_get_agent_tip_success(self, authenticated_client, mock_gemini_api):
        """測試成功獲取每日提示"""
        response = authenticated_client.get('/api/agent/tip', headers={
            'X-Api-Key': 'test-api-key'
        })
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'tip_html' in data
        assert len(data['tip_html']) > 0

    def test_get_agent_tip_missing_api_key(self, authenticated_client):
        """測試缺少 API 金鑰的情況"""
        response = authenticated_client.get('/api/agent/tip')
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data
        assert 'API金鑰' in data['error']

    def test_get_agent_tip_api_error(self, authenticated_client, mock_gemini_api_error):
        """測試 Gemini API 錯誤的情況"""
        response = authenticated_client.get('/api/agent/tip', headers={
            'X-Api-Key': 'test-api-key'
        })
        
        assert response.status_code == 500
        data = json.loads(response.data)
        assert 'error' in data

    def test_get_recommendation_success(self, authenticated_client, mock_gemini_api):
        """測試成功獲取飼養建議"""
        recommendation_data = {
            'api_key': 'test-api-key',
            'EarNum': 'TEST001',
            'Breed': '波爾羊',
            'Body_Weight_kg': 45.5,
            'Age_Months': 12,
            'Sex': '母',
            'status': '懷孕'
        }
        
        response = authenticated_client.post('/api/agent/recommendation', 
                                           json=recommendation_data)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'recommendation_html' in data
        assert len(data['recommendation_html']) > 0

    def test_get_recommendation_validation_error(self, authenticated_client):
        """測試資料驗證錯誤"""
        # 缺少必要的 api_key
        recommendation_data = {
            'EarNum': 'TEST001',
            'Breed': '波爾羊'
        }
        
        response = authenticated_client.post('/api/agent/recommendation', 
                                           json=recommendation_data)
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'field_errors' in data

    def test_get_recommendation_with_invalid_weight(self, authenticated_client):
        """測試體重驗證"""
        recommendation_data = {
            'api_key': 'test-api-key',
            'EarNum': 'TEST001',
            'Body_Weight_kg': -10.0  # 負數體重應該失敗
        }
        
        response = authenticated_client.post('/api/agent/recommendation', 
                                           json=recommendation_data)
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'field_errors' in data
        assert 'Body_Weight_kg' in data['field_errors']

    def test_get_recommendation_with_sheep_context(self, authenticated_client, 
                                                 test_sheep, mock_gemini_api):
        """測試包含羊隻背景資料的建議"""
        recommendation_data = {
            'api_key': 'test-api-key',
            'EarNum': test_sheep.EarNum,  # 使用現有羊隻的耳號
            'Body_Weight_kg': 50.0
        }
        
        response = authenticated_client.post('/api/agent/recommendation', 
                                           json=recommendation_data)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'recommendation_html' in data

    def test_chat_with_agent_success(self, authenticated_client, mock_gemini_api):
        """測試成功的聊天互動"""
        chat_data = {
            'api_key': 'test-api-key',
            'message': '請問羊隻的最佳飼養溫度是多少？',
            'session_id': 'test-session-001'
        }
        
        response = authenticated_client.post('/api/agent/chat', json=chat_data)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'reply_html' in data
        assert len(data['reply_html']) > 0

    def test_chat_with_agent_validation_error(self, authenticated_client):
        """測試聊天資料驗證錯誤"""
        # 缺少必要欄位
        chat_data = {
            'api_key': 'test-api-key',
            'message': '測試訊息'
            # 缺少 session_id
        }
        
        response = authenticated_client.post('/api/agent/chat', json=chat_data)
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'field_errors' in data

    def test_chat_with_sheep_context(self, authenticated_client, test_sheep, mock_gemini_api):
        """測試包含羊隻上下文的聊天"""
        chat_data = {
            'api_key': 'test-api-key',
            'message': '這隻羊隻的健康狀況如何？',
            'session_id': 'test-session-002',
            'ear_num_context': test_sheep.EarNum
        }
        
        response = authenticated_client.post('/api/agent/chat', json=chat_data)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'reply_html' in data

    def test_chat_history_saved(self, authenticated_client, test_user, mock_gemini_api):
        """測試聊天記錄是否正確儲存"""
        chat_data = {
            'api_key': 'test-api-key',
            'message': '測試訊息',
            'session_id': 'test-session-003'
        }
        
        # 執行聊天
        response = authenticated_client.post('/api/agent/chat', json=chat_data)
        assert response.status_code == 200
        
        # 檢查資料庫中的聊天記錄
        user_message = ChatHistory.query.filter_by(
            user_id=test_user.id,
            session_id='test-session-003',
            role='user'
        ).first()
        
        model_message = ChatHistory.query.filter_by(
            user_id=test_user.id,
            session_id='test-session-003',
            role='model'
        ).first()
        
        assert user_message is not None
        assert user_message.content == '測試訊息'
        assert model_message is not None
        assert len(model_message.content) > 0

    def test_chat_api_error_handling(self, authenticated_client, mock_gemini_api_error):
        """測試 API 錯誤處理"""
        chat_data = {
            'api_key': 'test-api-key',
            'message': '測試訊息',
            'session_id': 'test-session-004'
        }
        
        response = authenticated_client.post('/api/agent/chat', json=chat_data)
        
        assert response.status_code == 500
        data = json.loads(response.data)
        assert 'error' in data

    def test_recommendation_with_all_fields(self, authenticated_client, mock_gemini_api):
        """測試包含所有欄位的飼養建議請求"""
        recommendation_data = {
            'api_key': 'test-api-key',
            'EarNum': 'FULL001',
            'Breed': '波爾羊',
            'Body_Weight_kg': 45.5,
            'Age_Months': 18,
            'Sex': '母',
            'status': '哺乳',
            'target_average_daily_gain_g': 150.0,
            'milk_yield_kg_day': 2.5,
            'milk_fat_percentage': 4.2,
            'number_of_fetuses': 2,
            'other_remarks': '這隻羊隻食慾良好，活動力正常。'
        }
        
        response = authenticated_client.post('/api/agent/recommendation', 
                                           json=recommendation_data)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'recommendation_html' in data

    def test_unauthenticated_access(self, client):
        """測試未認證用戶的訪問"""
        # 測試每日提示
        response = client.get('/api/agent/tip', headers={
            'X-Api-Key': 'test-api-key'
        })
        assert response.status_code == 401

        # 測試飼養建議
        response = client.post('/api/agent/recommendation', json={
            'api_key': 'test-api-key',
            'EarNum': 'TEST001'
        })
        assert response.status_code == 401

        # 測試聊天
        response = client.post('/api/agent/chat', json={
            'api_key': 'test-api-key',
            'message': '測試',
            'session_id': 'test'
        })
        assert response.status_code == 401

    @pytest.mark.parametrize("field,invalid_value,expected_error", [
        ('Body_Weight_kg', -5.0, '體重'),
        ('Age_Months', -1, '月齡'),
        ('milk_fat_percentage', 150.0, '乳脂率'),
        ('number_of_fetuses', -1, '懷胎數'),
    ])
    def test_recommendation_field_validation(self, authenticated_client, 
                                           field, invalid_value, expected_error):
        """測試各欄位的驗證邏輯"""
        recommendation_data = {
            'api_key': 'test-api-key',
            'EarNum': 'VALID001',
            field: invalid_value
        }
        
        response = authenticated_client.post('/api/agent/recommendation', 
                                           json=recommendation_data)
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'field_errors' in data
        assert field in data['field_errors']
