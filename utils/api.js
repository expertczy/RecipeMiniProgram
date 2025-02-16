const API_ENDPOINT = 'https://7ghbxbrcgf.execute-api.eu-west-2.amazonaws.com'

export const api = {
  async getDishes() {
    try {
      const res = await wx.request({
        url: `${API_ENDPOINT}/dishes`,
        method: 'GET',
        header: {
          'Content-Type': 'application/json'
        }
      })
      return res.data
    } catch (error) {
      console.error('Error fetching dishes:', error)
      throw error
    }
  },

  async addDish(dish) {
    try {
      const res = await wx.request({
        url: `${API_ENDPOINT}/dishes`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        data: dish
      })
      return res.data
    } catch (error) {
      console.error('Error adding dish:', error)
      throw error
    }
  },

  async updateDish(id, dish) {
    try {
      const res = await wx.request({
        url: `${API_ENDPOINT}/dishes/${id}`,
        method: 'PUT',
        data: dish,
        header: {
          'Content-Type': 'application/json'
        }
      })
      return res.data
    } catch (error) {
      console.error('Error updating dish:', error)
      throw error
    }
  },

  async deleteDish(id) {
    try {
      const res = await wx.request({
        url: `${API_ENDPOINT}/dishes/${id}`,
        method: 'DELETE',
        header: {
          'Content-Type': 'application/json'
        }
      })
      return res.data
    } catch (error) {
      console.error('Error deleting dish:', error)
      throw error
    }
  }
} 