//index.js
const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    background:'/images/bg.png',
    list:[]
  },

  onLoad: function() {
    if (app.globalData.openId && app.globalData.openId != '') {
      this.setData({
        openId: app.globalData.openId
      });
    } else {
      // app.js中getOpenId是云函数，可能会在 Page.onLoad 之后才返回，所以此处加入 callback 以防止这种情况
      app.openIdCallback = openId => {
        if (openId != '') {
          this.setData({
            openId: openId
          });
        }
      }
    }
    // 本地图片转base64
    let base64 = wx.getFileSystemManager().readFileSync(this.data.background, 'base64');
    this.setData({
      background: 'data:image/png;base64,' + base64
    });
  },
  onShow(){
    this.getUserAlbum()
  },
  getUserAlbum(){
    let that = this
    db.collection('userAlbum').where({
      _openid:app.globalData.openId
    }).get().then(res=>{
      console.log('getUserAlbum:',res)
      let list = res.data.reverse()
      list.forEach(item=>{
        item.images = item.images.reverse()
      })
      this.setData({
        list
      })
    })
  },
  gotoAdd() {
    wx.navigateTo({
      url: '../upload/upload',
    })
  },
  gotoDetail(e) {
    wx.navigateTo({
      url: '../detail/detail?detail='+JSON.stringify(e.currentTarget.dataset['img']),
    })
  }
})