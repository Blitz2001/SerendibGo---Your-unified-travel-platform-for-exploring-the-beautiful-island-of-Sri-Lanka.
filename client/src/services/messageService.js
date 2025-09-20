import apiService from './apiService';

class MessageService {
  // Send a message to a guide
  async sendMessage(messageData) {
    try {
      const response = await apiService.post('/api/messages', messageData);
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Get user's messages (sent and received)
  async getMyMessages(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.type) queryParams.append('type', params.type);

      const url = `/api/messages${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // Get a specific message
  async getMessage(messageId) {
    try {
      const response = await apiService.get(`/api/messages/${messageId}`);
      return response;
    } catch (error) {
      console.error('Error fetching message:', error);
      throw error;
    }
  }

  // Reply to a message
  async replyToMessage(messageId, replyMessage) {
    try {
      const response = await apiService.post(`/api/messages/${messageId}/reply`, {
        message: replyMessage
      });
      return response;
    } catch (error) {
      console.error('Error replying to message:', error);
      throw error;
    }
  }

  // Mark message as read
  async markAsRead(messageId) {
    try {
      const response = await apiService.patch(`/api/messages/${messageId}/read`);
      return response;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  // Get unread message count
  async getUnreadCount() {
    try {
      const response = await apiService.get('/api/messages/unread-count');
      return response;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }
}

const messageService = new MessageService();
export default messageService;
