<template>
  <div id="app">
    <v-app>
      <v-container class="mb-4">
        <v-tabs icons-and-text centered dark color="teal">
          <v-tabs-slider color="teal lighten-5"></v-tabs-slider>
          <v-tab href="#tab-1">
            Rules
            <v-icon>fas fa-book</v-icon>
          </v-tab>
          <v-tab href="#tab-2">
            Mod
            <v-icon>fab fa-twitch</v-icon>
          </v-tab>
          <v-tab-item value="tab-1">
            <v-card class="pa-2" color="teal lighten-5" flat>
              <div>[網頁說明] 本網頁將觀眾剪下的clips 透過twitch的API整合在一起 方便大家觀看</div>
              <div>[指令說明] 我們有個指令「!片+」讓各位可以投稿clip一起來壯大我們no精華區，只要輸入「!片+ [clips網址後半部的代碼]」就可以惹是不是很簡單ㄋ。例子: 「!片+ DistinctDeerMrDestructoid」</div>
              <div>[標題說明] 新系統會直接抓你在剪輯時命名的標題 讓你可以在Twitch Clips自由更換標題</div>
              <div>[刪除說明] 若輸入錯代碼ID 或標題格式不對 導致影片錯誤的話 請向MOD反應來將影片從表單移除</div>
              <div>[表單連結] <a target="_blank" href="http://twitch.center/customapi/quote/list?token=96a4694e" style="cursor: pointer;">http://twitch.center/customapi/quote/list?token=96a4694e</a> </div>
            </v-card>
          </v-tab-item>
          <v-tab-item value="tab-2">
            <v-card class="pa-2" color="teal lighten-5" flat>
              <v-card-text>
                <div>表單內格式有問題的Clips: {{errorclips}}</div>
                <div>網頁開發: 克里斯</div>
              </v-card-text>
            </v-card>
          </v-tab-item>
        </v-tabs>
        <v-layout row wrap class="cliparea">
          <v-flex v-if="loading" xs12>
            <v-progress-circular :size="70" :width="7" indeterminate color="teal"></v-progress-circular>
          <v-flex xs12 style="font-size:2rem;">
            {{loadtext}}
          </v-flex>
          </v-flex>          
          <v-flex v-if="!loading" xs12 sm6 md4 lg3 xl2 v-for="(n,index) in Math.min(startcount+1, page_count)" :key="index">
            <v-card color="teal lighten-5" class="ma-1 clipcard">
              <a style="position:relative" :href="clipList[clipList.length-(page-1)*page_count-n].url" target="_blank">
                <v-img class="cardimage" :src="clipList[clipList.length-(page-1)*page_count-n].thumbnail_url" height="200px">
                </v-img>
              </a>
              <v-card-title class="wb">
                <a :href="clipList[clipList.length-(page-1)*page_count-n]['url']" target="_blank">
                  <v-flex xs12>
                    {{`[${clipList[clipList.length-(page-1)*page_count-n]['Num']}.] `}}{{clipList[clipList.length-(page-1)*page_count-n]['title']}}
                  </v-flex>
                </a>
                <v-flex xs12 style="font-size:1.1rem" v-if="clipList[clipList.length-(page-1)*page_count-n]['creator_id']!=''">
                  剪輯：
                  <a :href="userList[clipList[clipList.length-(page-1)*page_count-n].creator_id]['url']" target="_blank">
                    {{userList[clipList[clipList.length-(page-1)*page_count-n].creator_id]['display_name']}}
                  </a>
                </v-flex>
                <v-flex style="font-size:1.1rem" xs12>
                  {{clipList[clipList.length-(page-1)*page_count-n]['created_at'] | timetz}}
                </v-flex>
                <v-flex v-if="clipList[clipList.length-(page-1)*page_count-n]['game_id']!=''" style="font-size:1.1rem" xs12>
                  <a :href="gameList[clipList[clipList.length-(page-1)*page_count-n]['game_id']]['url']" target="_blank">
                  {{gameList[clipList[clipList.length-(page-1)*page_count-n]['game_id']]['name']}}
                  </a>
                </v-flex>
              </v-card-title>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
      <v-layout class="pagi pt-2 pb-2" row wrap align-content-center>
        <v-flex xs12>
          <v-pagination :disabled="loading" :length="page_MAX" v-model="page" color="teal" prev-icon="fas fa-angle-left" next-icon="fas fa-angle-right"></v-pagination>
        </v-flex>
      </v-layout>
    </v-app>
  </div>
</template>

<script>

export default {
  name: 'App',
  data(){
    return {
      ClientID: ['kimne78kx3ncx6brgo4mv6wki5h1ko',
                'f03diai4g1nzfwo3om1s87jvdq65hax',
                'apbhlybpld3ybc6grv5c118xqpoz01c'],
      clipJSON: [],
      clipNum: {},
      clipList: [],
      userList: {},
      gameList: {},
      errorclips:[],
      usertempset: null,
      gametempset: null,
      loadtext: '讀取網頁中...',
      page: 1,
      oldpage:1,
      page_MAX: 10,
      page_count: 84,
      startcount: 0,
      loading: true
    };
  },
  watch: {
    page: function (val,oldval) {
      this.loading = true;
      this.oldpage = oldval;
      this.getList(val);
    }
  },
  filters: {
    timetz: function (value) {
      if (!value) {
        return '';
      } else {
        return value.replace('T',' ').replace('Z',' ');
      }
    }
  },
  methods: {
    async getRequest (url) {
      let Jdata = await (await (fetch(url)
        .then(res => {
          return res.json();
        })
        .catch(err => {
          console.log('Error: ', err);
        })
      ));
      return Jdata;
    },
    async getTwitchRequest (url) {
      this.loadtext='與Twitch伺服器連線中...';
      let Jdata = await (await (fetch(url,{headers: {
        'Client-ID': this.ClientID[Math.floor(Math.random() * 2)]
        }})
        .then(res => {
          if(res.ok) {
            this.loadtext = '取得資料中...';
            return res.json();
          }else if(res.status===429){
            // Need "Access-Control-Expose-Headers"
            this.loadtext = '已達Twitch伺服器流量限制(30次/每半分鐘)，請稍後再執行';
            this.page = this.oldpage;
            return null;
          }
        })
        .catch(err => {
          console.log('Error: ', err);
          return null;
        })
      ));
      return Jdata;
    },
    async getList(val){

      /** Clips Page Range **/
      let startcount = this.clipJSON.length - (val-1)*this.page_count -1;
      this.startcount = startcount;
      let endcount = startcount-this.page_count;
      if(endcount<0){
        endcount = -1;
      }

      /** If Already Exist **/
      if(this.clipList[startcount]['id']!==''){
        this.loading = false;
        return null;
      }

      /** Get Clips Data **/
      let ClipsBaseURL = 'https://api.twitch.tv/helix/clips?';
      let TempURL = ClipsBaseURL;
      for(let i=startcount;i>endcount;i--){
        TempURL += `&id=${this.clipJSON[i].ID}`;
      }
      let ClipsResponse = await this.getTwitchRequest(TempURL);
      if (ClipsResponse){
        ClipsResponse.data.forEach(element => {
          element['Num'] = this.clipNum[element.id]['Num'];
          let tempnum = parseInt(element['Num']);
          //Twitch Clips Issues (some clips thumbnail medium url 404 not found)
          if((tempnum<=68)||(tempnum === 119)||(tempnum === 120)){
            //tiny
            element['thumbnail_url'] = element['thumbnail_url'].replace('480x272', '86x45');
          }else{
            //medium
            element['thumbnail_url'] = element['thumbnail_url'].replace('480x272', '260x147');
          }
          this.clipList[this.clipNum[element.id]['Index']] = element;
          if(!this.userList[element['broadcaster_id']]){
            this.userList[element['broadcaster_id']] = {
              'display_name':'',
              'url':''
            };
            this.usertempset.add(element['broadcaster_id']);
          }
          if(!this.userList[element['creator_id']]){
            this.userList[element['creator_id']] = {
              'display_name':'',
              'url':''
            };
            this.usertempset.add(element['creator_id']);
          }
          if(element['game_id']!=''){
            if(!this.gameList[element['game_id']]){
              this.gameList[element['game_id']] = {
                'name':'null',
                'url':'https://www.twitch.tv/directory/game/null'
              };
              this.gametempset.add(element['game_id']);
            }
          }
        });
      }else{
        // 429 and error
        // waiting for API Update
        // Need "Access-Control-Expose-Headers"
      }
      
      /** Get User Data **/
      let UserBaseURL = 'https://api.twitch.tv/helix/users?';
      if(this.usertempset.size>0){
        TempURL = UserBaseURL;
        this.usertempset.forEach(element => {
          TempURL += `&id=${element}`;
        });
        let UserResponse = await this.getTwitchRequest(TempURL);
        if(UserResponse){
          this.usertempset.clear();
          UserResponse.data.forEach(element => {
            this.userList[element['id']] = {
              'display_name': element['display_name'],
              'url': `https://www.twitch.tv/${element['login']}`
              };
          });
        }
      }

      /** Get Game Data **/
      let GamesBaseURL = 'https://api.twitch.tv/helix/games?';
      if(this.gametempset.size>0){
        TempURL = GamesBaseURL;
        this.gametempset.forEach(element => {
          TempURL += `&id=${element}`;
        });
        let GamesResponse = await this.getTwitchRequest(TempURL);
        if(GamesResponse){
          this.gametempset.clear();
          GamesResponse.data.forEach(element => {
            this.gameList[element['id']] = {
              'name': element['name'],
              'url': `https://www.twitch.tv/directory/game/${encodeURI(element['name'])}`
              };
          });
        }
      }
      this.loading = false;
    },
    async getJSON () {
      this.clipJSON = await this.getRequest('http://crs-dlbot.herokuapp.com/clips');
      this.loadtext='表單資料讀取中...';
      this.clipNum = this.clipJSON.reduce(function(result, item, index) {
        result[item.ID] = {"Num":item.Num,"Index":index};
        return result;
      }, {});
      this.clipList = new Array(this.clipJSON.length).fill().map(u => ({
        "Num": 'XXX',
        "id": '',
        "url": '',
        "title": 'ERROR',
        "embed_url": '',
        "creator_id": '',
        "created_at": null,
        "game_id": '',
        "thumbnail_url": ''
      }));
      for(let i = 0, j = 1; i < this.clipJSON.length; i++,j++){
        if(j!=this.clipJSON[i].Num){
          this.errorclips.push(j);
          i--;
        }
      }
      this.page_MAX = Math.ceil(this.clipJSON.length/this.page_count);
      this.getList(1);
    }
  },
  mounted(){
    this.usertempset = new Set();
    this.gametempset = new Set();
    this.loadtext='與Clips表單伺服器連線中...';
    this.getJSON();
  }
}
</script>

<style>
@import url(https://fonts.googleapis.com/earlyaccess/notosanstc.css);
* {
    font-family: 'Noto Sans TC';
}
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  font-size: 1.2rem;
  color: #2c3e50;
  background-color: #80CBC4;
}
.cliparea{
  padding-top:2%;
  padding-bottom:2%;
  background-color: #B2DFDB;
}
.pagi{
  width:100%;
  position: fixed;
  z-index: 10;
  bottom: 0;
  background: rgba(30, 31, 28, 0.9);
}
.clipcard{
  height:98% !important;
}
.wb{
  text-align: left;
  word-break: break-all;
}
.wb a{
  color:#1D1F1F;
  text-decoration: none;
}
.wb a:hover{
  color:#1D1F1F;
  text-decoration: underline;
}
.v-image__image{
  z-index:3;
}
.cardimage::after{
  position: absolute;
  z-index:2;
  width:100%;
  height:100%;
  content:"";
  background: url('https://static-cdn.jtvnw.net/ttv-static/404_preview-320x180.jpg') center center / cover no-repeat;
}
</style>
