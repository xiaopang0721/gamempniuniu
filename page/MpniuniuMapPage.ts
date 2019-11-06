/**
* 牛牛
*/
module gamempniuniu.page {
    const enum MAP_STATUS {
        PLAY_STATUS_GAME_NONE = 0, // 初始化
        PLAY_STATUS_GAME_START = 1, // 游戏开始
        PLAY_STATUS_GAME_SHUFFLE = 2, // 洗牌阶段
        PLAY_STATUS_PUSH_THREE = 3, // 发三张阶段
        PLAY_STATUS_GET_BANKER = 4, // 开始抢庄
        PLAY_STATUS_SET_BANKER = 5, // 定庄阶段
        PLAY_STATUS_BET = 6, // 下注阶段
        PLAY_STATUS_PUSH_TWO = 7, // 发两张阶段
        PLAY_STATUS_TANPAI = 8, // 摊牌阶段
        PLAY_STATUS_COMPARE = 9, // 比牌阶段
        PLAY_STATUS_SETTLE = 10, // 结算阶段
        PLAY_STATUS_SETTLE_INFO = 11, // 显示结算信息
        PLAY_STATUS_SHOW_GAME = 12 // 本局展示阶段
    }
    const MONEY_NUM = 50; // 特效金币数量
    const MONEY_FLY_TIME = 30; // 金币飞行时间间隔
    // 下注倍率配置
    const RATE_LIST = {
        "1": [1],
        "2": [1, 2],
        "3": [1, 2, 3],
        "4": [1, 2, 3, 4],
        "5": [1, 2, 3, 5],
        "6": [1, 2, 4, 6],
        "7": [1, 3, 5, 7],
        "8": [1, 3, 5, 8],
        "9": [1, 3, 6, 9],
        "10": [1, 3, 6, 10],
        "11": [1, 4, 7, 11],
        "12": [1, 4, 8, 12],
        "13": [1, 4, 9, 13],
        "14": [1, 5, 10, 14],
        "15": [1, 5, 10, 15],
    };
    // 房间底注和限入配置
    const ROOM_CONFIG = {
        "242": [1, 20],    //新手
        "243": [10, 200],  //初级
        "244": [50, 500],  //中级
        "245": [100, 1000],    //高级
    };
    const CARD_TYPE = ["没牛", "牛一", "牛二", "牛三", "牛四", "牛五", "牛六", "牛七", "牛八", "牛九", "牛牛", "四花牛", "五花牛", "炸弹", "五小牛"];    //牌型
    export class MpniuniuMapPage extends game.gui.base.Page {
        private _viewUI: ui.nqp.game_ui.mpniuniu.QiangZhuangNNUI;
        private _kuangView: ui.nqp.game_ui.tongyong.effect.SuiJiUI;//随机庄家框特效
        private _niuMgr: MpniuniuMgr;//牛牛管理器
        private _niuStory: any;//牛牛剧情类
        private _niuMapInfo: MpniuniuMapInfo;//牛牛地图信息类
        private _bankerList: Array<number> = [];//抢庄倍率集合
        private _betList: Array<number> = [];//下注倍率集合
        private _playerList: any = [];//精灵UI集合
        private _unitIndexOnTable: Array<number> = [];//精灵位置集合
        private _bankerWinInfo: Array<number> = [];//庄家赢牌信息集合
        private _bankerLoseInfo: Array<number> = [];//庄家输牌信息集合
        private _bankerRateInfo: Array<Array<number>> = [];//抢最大同倍庄集合
        private _clipList: Array<MpniuniuClip> = [];//飘字集合
        private _room_config: any = [];//房间等级底注信息
        private _bankerIndex: number;//庄家位置
        private _bankerBenefit: number;//庄家总收益
        private _mainPlayerBenefit: number;//玩家收益
        private _curStatus: number;//当前地图状态
        private _countDown: number;//倒计时时间戳
        private _isPlayXiPai: boolean = false;//播放洗牌
        private _getBankerCount: number = 0;//抢庄日志计数
        private _isPlaying: boolean = false;    //是否进行中

        constructor(v: Game, onOpenFunc?: Function, onCloseFunc?: Function) {
            super(v, onOpenFunc, onCloseFunc);
            this._isNeedDuang = false;
            this._delta = 1000;
            this._asset = [
                DatingPath.atlas_dating_ui + "qifu.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "hud.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "pai.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "general.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "touxiang.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "dating.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "qz.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "general/effect/suiji.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "general/effect/fapai_1.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "general/effect/xipai.atlas",
                Path_game_mpniuniu.atlas_game_ui + "mpniuniu.atlas",
                Path_game_mpniuniu.ui_mpniuniu + "sk/mpnn_0.png",
                Path_game_mpniuniu.ui_mpniuniu + "sk/mpnn_1.png",
                Path_game_mpniuniu.ui_mpniuniu + "sk/mpnn_2.png",
                Path_game_mpniuniu.ui_mpniuniu + "sk/mpnn_3.png",
            ];
        }

        // 页面初始化函数
        protected init(): void {
            this._viewUI = this.createView('game_ui.mpniuniu.QiangZhuangNNUI');
            this.addChild(this._viewUI);
            this.initView();
            if (!this._pageHandle) {
                this._pageHandle = PageHandle.Get("MpniuniuMapPage");//额外界面控制器
            }
            if (!this._niuMgr) {
                this._niuStory = this._game.sceneObjectMgr.story as MpniuniuStory;
                this._niuMgr = this._niuStory.niuMgr;
                this._niuMgr.on(MpniuniuMgr.DEAL_OVER, this, this.onUpdateAniDeal);
            }
            this._game.playMusic(Path_game_mpniuniu.music_mpniuniu + "nn_bgm.mp3");
            this._viewUI.btn_spread.left = this._game.isFullScreen ? 30 : 10;
            this._viewUI.box_menu.left = this._game.isFullScreen ? 25 : 10;
        }

        // 页面打开时执行函数
        protected onOpen(): void {
            super.onOpen();
            this.initBeiClip();
            //是否断线重连
            if (!this._niuStory.isReConnected) {
                this._game.uiRoot.general.open(TongyongPageDef.PAGE_TONGYONG_MATCH, null, (page) => {
                    this._viewUI.btn_continue.visible = page.dataSource;
                });
            } else {
                this.onUpdateMapInfo();
            }

            this.onUpdateUnitOffline();//初始化假的主玩家

            //所有监听
            this._viewUI.btn_spread.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_cardType.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_back.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_rule.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_chongzhi.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_set.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_continue.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_bankerRate0.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_bankerRate1.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_bankerRate2.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_bankerRate3.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_betRate1.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_betRate2.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_betRate3.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_betRate4.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_tanpai.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_zhanji.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_qifu.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_ADD_UNIT, this, this.onUnitAdd);
            this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_REMOVE_UNIT, this, this.onUnitRemove);
            this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_UNIT_MONEY_CHANGE, this, this.onUpdateUnit);
            this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_UNIT_CHANGE, this, this.onUpdateUnit);
            this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_UNIT_ACTION, this, this.onUpdateUnit);
            this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_UNIT_QIFU_TIME_CHANGE, this, this.onUpdateUnit);
            this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_MAPINFO_CHANGE, this, this.onUpdateMapInfo);

            this._game.sceneObjectMgr.on(MpniuniuMapInfo.EVENT_STATUS_CHECK, this, this.onUpdateStatus);
            this._game.sceneObjectMgr.on(MpniuniuMapInfo.EVENT_BATTLE_CHECK, this, this.onUpdateBattle);
            this._game.sceneObjectMgr.on(MpniuniuMapInfo.EVENT_GAME_ROUND_CHANGE, this, this.onUpdateGameRound);
            this._game.sceneObjectMgr.on(MpniuniuMapInfo.EVENT_GAME_NO, this, this.onUpdateGameNo);//牌局号
            this._game.sceneObjectMgr.on(MpniuniuMapInfo.EVENT_COUNT_DOWN, this, this.onUpdateCountDown);//倒计时更新
            this._viewUI.xipai.ani_xipai.on(LEvent.COMPLETE, this, this.onWashCardOver);

            this._game.qifuMgr.on(QiFuMgr.QIFU_FLY, this, this.qifuFly);
        }

        private _curDiffTime: number;
        update(diff: number) {
            super.update(diff);
            if (!this._curDiffTime || this._curDiffTime < 0) {
                this._viewUI.btn_chongzhi.ani1.play(0, false);
                this._curDiffTime = TongyongPageDef.CZ_PLAY_DIFF_TIME;
            } else {
                this._curDiffTime -= diff;
            }
        }

        //倍数
        private _beiClip1: ClipUtil;
        private _beiClip2: ClipUtil;
        private _beiClip3: ClipUtil;
        private _beiClip4: ClipUtil;
        initBeiClip(): void {
            for (let i = 1; i < 5; i++) {
                this["_beiClip" + i] = new ClipUtil(ClipUtil.BEI_FONT);
                this["_beiClip" + i].centerX = this._viewUI["clip_betRate" + i].centerX;
                this["_beiClip" + i].centerY = this._viewUI["clip_betRate" + i].centerY;
                this._viewUI["clip_betRate" + i].parent.addChild(this["_beiClip" + i]);
                this._viewUI["clip_betRate" + i].visible = false;
            }
        }

        clearBeiClip(): void {
            for (let i = 1; i < 5; i++) {
                if (this["_beiClip" + i]) {
                    this["_beiClip" + i].removeSelf();
                    this["_beiClip" + i].destroy();
                    this["_beiClip" + i] = null;
                }
            }
        }

        //帧间隔心跳
        deltaUpdate() {
            if (!(this._niuMapInfo instanceof MpniuniuMapInfo)) return;
            if (!this._viewUI) return;
            if (this._curStatus == MAP_STATUS.PLAY_STATUS_SET_BANKER || this._curStatus == MAP_STATUS.PLAY_STATUS_GAME_START || this._curStatus == MAP_STATUS.PLAY_STATUS_PUSH_THREE
                || this._curStatus == MAP_STATUS.PLAY_STATUS_PUSH_TWO || this._curStatus == MAP_STATUS.PLAY_STATUS_COMPARE || this._curStatus == MAP_STATUS.PLAY_STATUS_GAME_SHUFFLE
                || this._curStatus == MAP_STATUS.PLAY_STATUS_SETTLE) {
                return;
            }
            let curTime = this._game.sync.serverTimeBys;
            let time = Math.floor(this._countDown - curTime);
            if (time > 0) {
                this._viewUI.box_timer.visible = true;
                this._viewUI.box_timer.txt_time.text = time.toString();

            } else {
                this._viewUI.box_timer.visible = false;
            }
        }

        //玩家进来了
        private onUnitAdd(u: Unit) {
            this.onUpdateUnit();
        }

        //玩家出去了
        private onUnitRemove(u: Unit) {
            this.onUpdateUnit();
            //离场清除桌上卡牌
            this._niuMgr.clearCardObject(u.GetIndex());
        }

        //更新发牌动画
        private onUpdateAniDeal(): void {
            this._viewUI.paixie.ani2.gotoAndStop(0);
        }

        private onWashCardOver(): void {
            if (!this._isPlayXiPai) return;
            Laya.Tween.to(this._viewUI.xipai, { x: 1007, y: 165, alpha: 0, rotation: -30, scaleX: 0.35, scaleY: 0.35 }, 500);
            Laya.timer.once(500, this, () => {
                this._viewUI.paixie.cards.visible = true;
                this._viewUI.paixie.ani_chupai.play(0, false);
                this._isPlayXiPai = false;
            })
        }

        private onUpdateMapInfo(): void {
            let mapinfo = this._game.sceneObjectMgr.mapInfo;
            this._niuMapInfo = mapinfo as MpniuniuMapInfo;
            if (mapinfo) {
                this.onUpdateStatus();
                this.onUpdateUnit();
                this.onUpdateBattle();
                this.onUpdateCountDown();
                if (this._curStatus > MAP_STATUS.PLAY_STATUS_GAME_NONE) {
                    this._viewUI.paixie.cards.visible = true;
                }
                this._viewUI.btn_continue.visible = false;
                if (this._niuStory.isReConnected) {
                    this._niuStory.mapLv = mapinfo.GetMapLevel();
                    this.initRoomConfig();
                    this.onUpdateGameNo();
                    this.onUpdateGameRound();
                }
            } else {
                this.onUpdateUnitOffline();
                this._game.uiRoot.general.open(TongyongPageDef.PAGE_TONGYONG_MATCH, null, (page) => {
                    this._viewUI.btn_continue.visible = page.dataSource;
                });
                this._viewUI.btn_continue.visible = false;
            }
        }

        private onUpdateUnitOffline() {
            if (!this._niuMgr.offlineUnit) return;
            let unitOffline = this._niuMgr.offlineUnit;
            let mPlayer = this._game.sceneObjectMgr.mainPlayer;
            if (unitOffline) {
                this._viewUI.view0.visible = true;
                let money;
                if (mPlayer) {
                    if (!mPlayer.playerInfo) return;
                    money = mPlayer.playerInfo.money;
                    this._viewUI.view0.view_icon.txt_name.text = getMainPlayerName(mPlayer.playerInfo.nickname);
                    this._viewUI.view0.view_icon.img_icon.skin = TongyongUtil.getHeadUrl(mPlayer.playerInfo.headimg);
                    this._viewUI.view0.view_icon.img_qifu.visible = TongyongUtil.getIsHaveQiFu(mPlayer, this._game.sync.serverTimeBys);
                    //头像框
                    this._viewUI.view0.view_icon.img_txk.skin = TongyongUtil.getTouXiangKuangUrl(mPlayer.playerInfo.headKuang);
                    //vip标识
                    this._viewUI.view0.view_icon.img_vip.visible = mPlayer.playerInfo.vip_level > 0;
                    this._viewUI.view0.view_icon.img_vip.skin = TongyongUtil.getVipUrl(mPlayer.playerInfo.vip_level);
                } else {
                    money = unitOffline.GetMoney();
                    this._viewUI.view0.view_icon.txt_name.text = getMainPlayerName(unitOffline.GetName());
                    this._viewUI.view0.view_icon.img_icon.skin = TongyongUtil.getHeadUrl(unitOffline.GetHeadImg());
                    this._viewUI.view0.view_icon.img_qifu.visible = TongyongUtil.getIsHaveQiFu(unitOffline, this._game.sync.serverTimeBys);
                    //头像框
                    this._viewUI.view0.view_icon.img_txk.skin = TongyongUtil.getTouXiangKuangUrl(unitOffline.GetHeadKuangImg());
                }
                this._viewUI.view0.view_icon.txt_money.text = EnumToString.getPointBackNum(money, 2).toString();
            }
        }

        private onUpdateUnit(qifu_index?: number) {
            if (!this._niuMapInfo) return;
            let battleInfoMgr = this._niuMapInfo.battleInfoMgr;
            this._unitIndexOnTable = [];
            //主玩家的座位
            if (!this._game.sceneObjectMgr.mainUnit) return;
            let idx = this._game.sceneObjectMgr.mainUnit.GetIndex();
            for (let index = 0; index < MpniuniuMgr.MAX_SEATS_COUNT; index++) {
                let posIdx = (idx + index) % MpniuniuMgr.MAX_SEATS_COUNT == 0 ? MpniuniuMgr.MAX_SEATS_COUNT : (idx + index) % MpniuniuMgr.MAX_SEATS_COUNT;
                let unit = this._game.sceneObjectMgr.getUnitByIdx(posIdx);
                this._playerList[index].visible = unit;
                if (unit) {
                    this._unitIndexOnTable.push(index);
                    this._playerList[index].view_icon.txt_name.text = getMainPlayerName(unit.GetName());
                    if ((this._curStatus != MAP_STATUS.PLAY_STATUS_COMPARE && this._curStatus != MAP_STATUS.PLAY_STATUS_SETTLE) || this._niuStory.isReConnected) {
                        this.updateMoney();
                    }
                    // this._playerList[index].img_isReady.visible = unit.IsReady() && status < 1;
                    if (unit.GetIdentity() == 1) {
                        this._bankerIndex = index;
                        if (this._niuStory.isReConnected && this._curStatus > MAP_STATUS.PLAY_STATUS_GET_BANKER && this._bankerRateList[index]) {
                            this._playerList[index].box_bankerRate.visible = true;
                            this._playerList[index].box_notBet.visible = false;
                            this._playerList[index].img_bankerRate.skin = StringU.substitute(Path_game_mpniuniu.ui_mpniuniu + "bei_{0}.png", this._bankerRateList[index]);
                            this._playerList[index].view_icon.img_banker.visible = true;
                            this._playerList[index].view_icon.img_banker.ani1.gotoAndStop(28);
                        }
                        if (unit.GetIndex() == idx)
                            this._viewUI.box_betRate.visible = false;
                    } else {
                        if (this._niuStory.isReConnected && this._curStatus > MAP_STATUS.PLAY_STATUS_GET_BANKER) {
                            this._playerList[index].box_bankerRate.visible = false;
                            this._playerList[index].box_notBet.visible = false;
                        }
                    }
                    //头像框
                    this._playerList[index].view_icon.img_txk.skin = TongyongUtil.getTouXiangKuangUrl(unit.GetHeadKuangImg());
                    //vip
                    this._playerList[index].view_icon.img_vip.visible = unit.GetVipLevel() > 0;
                    this._playerList[index].view_icon.img_vip.skin = TongyongUtil.getVipUrl(unit.GetVipLevel());
                    //祈福成功 头像上就有动画
                    if (qifu_index && posIdx == qifu_index) {
                        this._playerList[index].view_icon.qifu_type.visible = true;
                        this._playerList[index].view_icon.qifu_type.skin = this._qifuTypeImgUrl;
                        this.playTween(this._playerList[index].view_icon.qifu_type, qifu_index);
                    }
                    //时间戳变化 才加上祈福标志
                    if (TongyongUtil.getIsHaveQiFu(unit, this._game.sync.serverTimeBys)) {
                        if (qifu_index && posIdx == qifu_index) {
                            Laya.timer.once(2500, this, () => {
                                this._playerList[index].view_icon.img_qifu.visible = true;
                                this._playerList[index].view_icon.img_icon.skin = TongyongUtil.getHeadUrl(unit.GetHeadImg());
                            })
                        } else {
                            this._playerList[index].view_icon.img_qifu.visible = true;
                            this._playerList[index].view_icon.img_icon.skin = TongyongUtil.getHeadUrl(unit.GetHeadImg());
                        }
                    } else {
                        this._playerList[index].view_icon.img_qifu.visible = false;
                        this._playerList[index].view_icon.img_icon.skin = TongyongUtil.getHeadUrl(unit.GetHeadImg());
                    }
                }
            }
        }

        private _diff: number = 500;
        private _timeList: { [key: number]: number } = {};
        private _firstList: { [key: number]: number } = {};
        private playTween(img: LImage, index: number, isTween?: boolean) {
            if (!img) return;
            if (!this._timeList[index]) {
                this._timeList[index] = 0;
            }
            if (this._timeList[index] >= 2500) {
                this._timeList[index] = 0;
                this._firstList[index] = 0;
                img.visible = false;
                return;
            }
            Laya.Tween.to(img, { alpha: isTween ? 1 : 0.2 }, this._diff, Laya.Ease.linearNone, Handler.create(this, this.playTween, [img, index, !isTween]), this._firstList[index] ? this._diff : 0);
            this._timeList[index] += this._diff;
            this._firstList[index] = 1;
        }

        private updateMoney(): void {
            if (!this._game.sceneObjectMgr.mainUnit) return;
            let idx = this._game.sceneObjectMgr.mainUnit.GetIndex();
            for (let index = 0; index < MpniuniuMgr.MAX_SEATS_COUNT; index++) {
                let posIdx = (idx + index) % MpniuniuMgr.MAX_SEATS_COUNT == 0 ? MpniuniuMgr.MAX_SEATS_COUNT : (idx + index) % MpniuniuMgr.MAX_SEATS_COUNT;
                let unit = this._game.sceneObjectMgr.getUnitByIdx(posIdx);
                this._playerList[index].visible = unit;
                if (unit) {
                    let momey = EnumToString.getPointBackNum(unit.GetMoney(), 2).toString();
                    this._playerList[index].view_icon.txt_money.text = momey;
                }
            }
        }

        //庄家赢钱，部分闲家输钱  表现
        private addBankerWinEff(): void {
            if (!this._bankerWinInfo) return;
            if (this._bankerWinInfo.length == 2) {//庄家全输
                return;
            }
            this._game.playSound(Path_game_mpniuniu.music_mpniuniu + "piaoqian.mp3", false);
            let bankerPos = this._bankerIndex;
            for (let i: number = 0; i < this._bankerWinInfo.length / 2; i++) {
                let index = i * 2;
                let unitPos = this.getUnitUIPos(this._bankerWinInfo[index]);
                let unitBenefit = this._bankerWinInfo[index + 1];
                if (unitPos == -1) continue;
                if (i < this._bankerWinInfo.length / 2 - 1) {
                    this.addMoneyFly(unitPos, bankerPos);
                    this.addMoneyClip(unitBenefit, unitPos);
                }
            }
            if (this._bankerBenefit >= 0) {
                this.addMoneyClip(this._bankerBenefit, bankerPos);
            }
        }

        //庄家输钱，部分闲家赢钱  表现
        private addBankerLoseEff(): void {
            if (!this._bankerLoseInfo) return;
            if (this._bankerLoseInfo.length == 2) {//庄家通杀
                return;
            }
            this._game.playSound(Path_game_mpniuniu.music_mpniuniu + "piaoqian.mp3", false);
            let bankerPos = this._bankerIndex;
            for (let i: number = 0; i < this._bankerLoseInfo.length / 2; i++) {
                let index = i * 2;
                let unitPos = this.getUnitUIPos(this._bankerLoseInfo[index]);
                let unitBenefit = this._bankerLoseInfo[index + 1];
                if (unitPos == -1) continue;
                if (i < this._bankerLoseInfo.length / 2 - 1) {
                    this.addMoneyFly(bankerPos, unitPos);
                    this.addMoneyClip(unitBenefit, unitPos);
                }
            }
            if (this._bankerBenefit < 0) {
                this.addMoneyClip(this._bankerBenefit, bankerPos);
            }
        }

        //根据实际位置获取精灵在UI上的逻辑位置
        private getUnitUIPos(_index): number {
            //主玩家的座位
            let idx = this._game.sceneObjectMgr.mainUnit.GetIndex();
            for (let index = 0; index < MpniuniuMgr.MAX_SEATS_COUNT; index++) {
                let posIdx = (idx + index) % MpniuniuMgr.MAX_SEATS_COUNT == 0 ? MpniuniuMgr.MAX_SEATS_COUNT : (idx + index) % MpniuniuMgr.MAX_SEATS_COUNT;
                let unit = this._game.sceneObjectMgr.getUnitByIdx(posIdx)
                if (unit && posIdx == _index) {
                    return index;
                }
            }
            return -1;
        }

        private addKuangView(_info): void {
            this._bankerList = _info;
            this._viewUI.addChild(this._kuangView);
            this._kuangView.ani1.gotoAndStop(0)
            this._count = 0;
            Laya.timer.loop(this._diff_ran, this, this.ranEffPos);
            this.ranEffPos();
        }

        private _diff_ran: number = 200;
        private _count: number = 0;
        private _curIndex: number = 0;
        private ranEffPos(): void {
            if (!this._game.mainScene || !this._game.mainScene.camera) return;
            if (!this._bankerList.length) return;
            if (this._curIndex >= this._bankerList.length) {
                this._curIndex = 0;
            }
            let randIndex = this.getUnitUIPos(this._bankerList[this._curIndex]);
            let posX = this._game.mainScene.camera.getScenePxByCellX(this._playerList[randIndex].x + this._playerList[randIndex].view_icon.x - 26);
            let posY = this._game.mainScene.camera.getScenePxByCellY(this._playerList[randIndex].y + this._playerList[randIndex].view_icon.y - 23);
            this._kuangView.pos(posX, posY);
            this._game.playSound(Path_game_mpniuniu.music_mpniuniu + "suiji.mp3", false);
            if (randIndex == this._bankerIndex) {
                if (this._count >= 2000) {
                    this._kuangView.ani1.play(0, false)
                    Laya.timer.once(1000, this, () => {
                        this._game.playSound(Path_game_mpniuniu.music_mpniuniu + "suidao.mp3", false);
                        this._playerList[this._bankerIndex].view_icon.img_banker.visible = true;
                        this._playerList[this._bankerIndex].view_icon.img_banker.ani1.play(0, false);
                    })
                    Laya.timer.clear(this, this.ranEffPos);
                    return;
                }
            }
            this._curIndex++;
            this._count += this._diff_ran;
        }

        //下注倍数按钮更新
        private onUpdateBetBtn(a: number, b: number, c: number) {
            let bankerMoney = a;
            let playerMoney = this._game.sceneObjectMgr.mainPlayer.playerInfo.money;
            let bankerRate = b;
            let base = c;
            let maxBetRate = Math.round(Math.min(bankerMoney / (9 * bankerRate * base), playerMoney / (bankerRate * base)));
            maxBetRate = maxBetRate > 15 ? 15 : maxBetRate == 0 ? 1 : maxBetRate;
            this._betList = RATE_LIST[maxBetRate.toString()]
            this._beiClip1.setText(this._betList[0], true);
            if (this._betList[1]) {
                this._beiClip2.setText(this._betList[1], true);
                this._viewUI.btn_betRate2.visible = true;
            } else {
                this._viewUI.btn_betRate2.visible = false;
            }
            if (this._betList[2]) {
                this._beiClip3.setText(this._betList[2], true);
                this._viewUI.btn_betRate3.visible = true;
            } else {
                this._viewUI.btn_betRate3.visible = false;
            }
            if (this._betList[3]) {
                this._beiClip4.setText(this._betList[3], true);
                this._viewUI.btn_betRate4.visible = true;
            } else {
                this._viewUI.btn_betRate4.visible = false;
            }
        }

        //战斗结构体更新
        private _battleIndex: number = -1;
        private onUpdateBattle() {
            if (!this._niuMapInfo) return;
            let battleInfoMgr = this._niuMapInfo.battleInfoMgr;
            if (!battleInfoMgr) return;
            for (let i = 0; i < battleInfoMgr.info.length; i++) {
                let battleInfo = battleInfoMgr.info[i] as gamecomponent.object.BattleInfoBase;
                if (battleInfo instanceof gamecomponent.object.BattleInfoBanker)  //抢庄
                {
                    if (this._battleIndex < i) {
                        this._battleIndex = i;
                        this._bankerRateInfo.push([battleInfo.SeatIndex, battleInfo.BetVal]);
                        this.onBattleBanker(battleInfo);
                        this._getBankerCount++;
                        if (this._getBankerCount == this.getUnitCount()) {
                            if (!this._niuStory.isReConnected)
                                this.setBanker();
                        }
                    }
                }
                else if (battleInfo instanceof gamecomponent.object.BattleInfoBetRate)  //定闲家下注倍数
                {
                    if (this._battleIndex < i) {
                        this._battleIndex = i;
                        this.onUpdateBetBtn(battleInfo.BankerMoney, battleInfo.BankerRate, battleInfo.Antes);
                    }
                }
                else if (battleInfo instanceof gamecomponent.object.BattleInfoBet) //下注
                {
                    if (this._battleIndex < i) {
                        this._battleIndex = i;
                        this.onBattleBet(battleInfo);
                    }
                }
                else if (battleInfo instanceof gamecomponent.object.BattleInfoPass)//拼牌
                {
                    if (this._battleIndex < i) {
                        this._battleIndex = i;
                        this.onBattlePinPai(battleInfo, this._niuMapInfo.GetMapState());
                    }
                }
                else if (battleInfo instanceof gamecomponent.object.BattleInfoPlayCard) //出牌
                {
                    if (this._battleIndex < i) {
                        this._battleIndex = i;
                        this.onBattlePlayCard(battleInfo);
                    }
                }
                else if (battleInfo instanceof gamecomponent.object.BattleInfoSettle)//结算
                {
                    if (this._battleIndex < i) {
                        this._battleIndex = i;
                        this.onBattleSettle(battleInfo);
                    }
                }
            }

        }

        private _bankerRate: number = 0;
        private setBanker(): void {
            let indexList = []
            let index = 1
            this._bankerRate = 0
            for (let i: number = 0; i < this._bankerRateInfo.length; i++) {
                if (this._bankerRateInfo[i][1] > this._bankerRate) {
                    this._bankerRate = this._bankerRateInfo[i][1];
                    indexList = [];
                    indexList.push(this._bankerRateInfo[i][0])
                } else if (this._bankerRateInfo[i][1] == this._bankerRate) {
                    indexList.push(this._bankerRateInfo[i][0])
                }
            }
            if (indexList.length == 1) {
                this._viewUI.addChild(this._kuangView);
                this._kuangView.ani1.play(0, false);
                let zhuangIndex = this.getUnitUIPos(indexList[0]);
                if (this._game.mainScene.camera) {
                    let posX = this._game.mainScene.camera.getScenePxByCellX(this._playerList[zhuangIndex].x + this._playerList[zhuangIndex].view_icon.x - 26);
                    let posY = this._game.mainScene.camera.getScenePxByCellY(this._playerList[zhuangIndex].y + this._playerList[zhuangIndex].view_icon.y - 23);
                    this._kuangView.pos(posX, posY);
                    Laya.timer.once(1000, this, () => {
                        this._game.playSound(Path_game_mpniuniu.music_mpniuniu + "suidao.mp3", false);
                        this._playerList[zhuangIndex].view_icon.img_banker.visible = true;
                        this._playerList[zhuangIndex].view_icon.img_banker.ani1.play(0, false);
                    })
                }
            } else {
                this.addKuangView(indexList);
            }
        }

        private _bankerRateList: number[] = [];
        private onBattleBanker(info: any): void {
            let flag: boolean = info.BetVal > 0;
            let index = this.getUnitUIPos(info.SeatIndex);
            this._bankerRateList[index] = info.BetVal ? info.BetVal : 1;
            if (this._niuStory.isReConnected && this._curStatus > MAP_STATUS.PLAY_STATUS_GET_BANKER) {
                if (index == this._bankerIndex) {
                    this._playerList[index].img_bankerRate.skin = StringU.substitute(Path_game_mpniuniu.ui_mpniuniu + "bei_{0}.png", this._bankerRateList[index]);
                }
            } else {
                this._playerList[index].box_notBet.visible = !flag;
                this._playerList[index].box_bankerRate.visible = flag;
                this._playerList[index].img_bankerRate.skin = StringU.substitute(Path_game_mpniuniu.ui_mpniuniu + "bei_{0}.png", info.BetVal);
            }
        }

        private onBattleBet(info: any): void {
            let index = this.getUnitUIPos(info.SeatIndex);
            this._playerList[index].box_betRate.visible = true;
            this.setBetRate(index, info.BetVal);
        }

        private onBattlePinPai(info: any, status: number): void {
            let index = this.getUnitUIPos(info.SeatIndex);
            if (status == MAP_STATUS.PLAY_STATUS_TANPAI) {
                this._game.playSound(Path_game_mpniuniu.music_mpniuniu + "gaipai.mp3", false);
            }
        }

        private onBattleSettle(info: any): void {
            if (this._game.sceneObjectMgr.mainUnit.GetIndex() == info.SeatIndex) {
                this._mainPlayerBenefit = parseFloat(info.SettleVal);
            }
            if (this.getUnitUIPos(info.SeatIndex) == this._bankerIndex) {
                this._bankerBenefit = parseFloat(info.SettleVal);
                this._bankerWinInfo.push(parseFloat(info.SeatIndex));
                this._bankerWinInfo.push(parseFloat(info.SettleVal));
                this._bankerLoseInfo.push(parseFloat(info.SeatIndex));
                this._bankerLoseInfo.push(parseFloat(info.SettleVal));
            } else {
                //庄家赢钱部分
                if (info.SettleVal < 0) {
                    this._bankerWinInfo.push(parseFloat(info.SeatIndex));
                    this._bankerWinInfo.push(parseFloat(info.SettleVal));
                }
                //庄家输钱部分
                if (info.SettleVal > 0) {
                    this._bankerLoseInfo.push(parseFloat(info.SeatIndex));
                    this._bankerLoseInfo.push(parseFloat(info.SettleVal));
                }
            }
        }

        private getUnitCount() {
            let count: number = 0;
            let unitDic = this._game.sceneObjectMgr.unitDic;
            if (unitDic) {
                for (let key in unitDic) {
                    count++;
                }
            }
            return count;
        }

        private onBattlePlayCard(info: any): void {
            let unitNum = this.getUnitCount();
            let cardType = this._niuMgr.checkCardsType(info.Cards);
            let playerIndex = this.getUnitUIPos(info.SeatIndex);//玩家真实位置转换为UI位置
            let headImg = this._game.sceneObjectMgr.getUnitByIdx(info.SeatIndex).GetHeadImg();
            let sex = parseInt(headImg) <= 10 ? 1 : 2;
            if (playerIndex == 0) {//主玩家
                Laya.timer.once(350, this, () => {
                    this._viewUI.box_showCard.visible = true;
                    this._viewUI.box_typeNiu.box_notNiu.visible = cardType == 0;
                    this._viewUI.box_bigNiu.visible = cardType > 7;
                    this._viewUI.box_typeNiu.box_niu.visible = cardType > 0;
                    this._viewUI.box_bigNiu.ani1.play(0, false);
                    cardType > 0 && this._viewUI.box_typeNiu.ani1.play(0, false);
                    this._game.playSound(Path_game_mpniuniu.music_mpniuniu + "" + StringU.substitute("niu{0}_{1}.mp3", cardType, sex), false);
                })
                if (cardType >= 10) {
                    this._viewUI.box_typeNiu.img_type.skin = StringU.substitute(Path_game_mpniuniu.ui_mpniuniu + "n_{0}.png", cardType);
                    this._viewUI.box_typeNiu.img_x.skin = StringU.substitute(Path_game_mpniuniu.ui_mpniuniu + "sz1_x.png");
                    this._viewUI.box_typeNiu.img_rate.skin = StringU.substitute(Path_game_mpniuniu.ui_mpniuniu + "sz1_{0}.png", this._niuMgr.checkCardsRate(cardType));
                } else {
                    this._viewUI.box_typeNiu.img_type.skin = StringU.substitute(Path_game_mpniuniu.ui_mpniuniu + "n_{0}.png", cardType);
                    this._viewUI.box_typeNiu.img_x.skin = StringU.substitute(Path_game_mpniuniu.ui_mpniuniu + "sz_x.png");
                    this._viewUI.box_typeNiu.img_rate.skin = StringU.substitute(Path_game_mpniuniu.ui_mpniuniu + "sz_{0}.png", this._niuMgr.checkCardsRate(cardType));
                }
            } else {//其他玩家
                Laya.timer.once(350, this, () => {
                    this._playerList[playerIndex].box_cardType.visible = true;
                    this._playerList[playerIndex].box_typeNiu.box_notNiu.visible = cardType == 0;
                    this._playerList[playerIndex].box_bigNiu.visible = cardType > 7;
                    this._playerList[playerIndex].box_typeNiu.box_niu.visible = cardType > 0;
                    this._playerList[playerIndex].box_bigNiu.ani1.play(0, false);
                    cardType > 0 && this._playerList[playerIndex].box_typeNiu.ani1.play(0, false);
                    this._game.playSound(Path_game_mpniuniu.music_mpniuniu + "" + StringU.substitute("niu{0}_{1}.mp3", cardType, sex), false);
                })
                if (cardType >= 10) {
                    this._playerList[playerIndex].box_typeNiu.img_type.skin = StringU.substitute(Path_game_mpniuniu.ui_mpniuniu + "n_{0}.png", cardType);
                    this._playerList[playerIndex].box_typeNiu.img_x.skin = StringU.substitute(Path_game_mpniuniu.ui_mpniuniu + "sz1_x.png");
                    this._playerList[playerIndex].box_typeNiu.img_rate.skin = StringU.substitute(Path_game_mpniuniu.ui_mpniuniu + "sz1_{0}.png", this._niuMgr.checkCardsRate(cardType));
                } else {
                    this._playerList[playerIndex].box_typeNiu.img_type.skin = StringU.substitute(Path_game_mpniuniu.ui_mpniuniu + "n_{0}.png", cardType);
                    this._playerList[playerIndex].box_typeNiu.img_x.skin = StringU.substitute(Path_game_mpniuniu.ui_mpniuniu + "sz_x.png");
                    this._playerList[playerIndex].box_typeNiu.img_rate.skin = StringU.substitute(Path_game_mpniuniu.ui_mpniuniu + "sz_{0}.png", this._niuMgr.checkCardsRate(cardType));
                }
            }
        }

        private getBeginIndex(): number {
            let index = this._unitIndexOnTable.indexOf(this._bankerIndex) + 1;
            if (index >= this._unitIndexOnTable.length) index = 0;

            return index;
        }

        //金币变化 飘金币特效
        public addMoneyFly(fromPos: number, tarPos: number): void {
            if (!this._game.mainScene || !this._game.mainScene.camera) return;
            let fromX = this._game.mainScene.camera.getScenePxByCellX(this._playerList[fromPos].x + this._playerList[fromPos].view_icon.x);
            let fromY = this._game.mainScene.camera.getScenePxByCellY(this._playerList[fromPos].y + this._playerList[fromPos].view_icon.y);
            let tarX = this._game.mainScene.camera.getScenePxByCellX(this._playerList[tarPos].x + this._playerList[tarPos].view_icon.x);
            let tarY = this._game.mainScene.camera.getScenePxByCellY(this._playerList[tarPos].y + this._playerList[tarPos].view_icon.y);
            for (let i: number = 0; i < MONEY_NUM; i++) {
                let posBeginX = MathU.randomRange(fromX + 23, fromX + 70);
                let posBeginY = MathU.randomRange(fromY + 23, fromY + 70);
                let posEndX = MathU.randomRange(tarX + 23, tarX + 65);
                let posEndY = MathU.randomRange(tarY + 23, tarY + 65);
                let moneyImg: LImage = new LImage(PathGameTongyong.ui_tongyong_general + "icon_money.png");
                moneyImg.scale(0.7, 0.7);
                if (!moneyImg.parent) this._viewUI.addChild(moneyImg);
                moneyImg.pos(posBeginX, posBeginY);
                // Laya.Bezier 贝塞尔曲线  取得点
                Laya.Tween.to(moneyImg, { x: posEndX }, i * MONEY_FLY_TIME, null);
                Laya.Tween.to(moneyImg, { y: posEndY }, i * MONEY_FLY_TIME, null, Handler.create(this, () => {
                    moneyImg.removeSelf();
                }));
            }
        }

        //金币变化 飘字clip
        public addMoneyClip(value: number, pos: number): void {
            let valueClip = value >= 0 ? new MpniuniuClip(MpniuniuClip.ADD_MONEY_FONT) : new MpniuniuClip(MpniuniuClip.SUB_MONEY_FONT);
            let preSkin = value >= 0 ? PathGameTongyong.ui_tongyong_general + "tu_jia.png" : PathGameTongyong.ui_tongyong_general + "tu_jian.png";
            valueClip.scale(0.8, 0.8);
            valueClip.anchorX = 0.5;
            valueClip.setText(Math.abs(value), true, false, preSkin);
            let playerIcon = this._playerList[pos].view_icon;
            valueClip.x = playerIcon.clip_money.x;
            valueClip.y = playerIcon.clip_money.y;
            playerIcon.clip_money.parent.addChild(valueClip);
            playerIcon.clip_money.visible = false;
            this._clipList.push(valueClip);
            Laya.Tween.clearAll(valueClip);
            Laya.Tween.to(valueClip, { y: valueClip.y - 30 }, 1500);
        }

        //清理所有飘字clip
        private clearClips(): void {
            if (this._clipList && this._clipList.length) {
                for (let i: number = 0; i < this._clipList.length; i++) {
                    let clip = this._clipList[i];
                    clip.removeSelf();
                    clip.destroy(true);
                }
            }
            this._clipList = [];
        }

        //更新倒计时时间戳
        private onUpdateCountDown(): void {
            if (!this._niuMapInfo) return;
            this._countDown = this._niuMapInfo.GetCountDown();
        }

        //设置下注倍数
        private setBetRate(i: number, val: number): void {
            let num1 = 0;
            let num2 = 0;
            if (val >= 10) {
                num1 = 1;
                num2 = val % 10;
                this._playerList[i].img_betRate2.visible = true;
            } else {
                num1 = val;
                this._playerList[i].img_betRate2.visible = false;
            }
            this._playerList[i].img_betRate1.skin = StringU.substitute(Path_game_mpniuniu.ui_mpniuniu + "bei_{0}.png", num1);
            this._playerList[i].img_betRate2.skin = StringU.substitute(Path_game_mpniuniu.ui_mpniuniu + "bei_{0}.png", num2);
        }

        //更新地图状态
        private onUpdateStatus() {
            if (!this._niuMapInfo) return;
            if (this._curStatus == this._niuMapInfo.GetMapState()) return;
            this._curStatus = this._niuMapInfo.GetMapState();
            this._viewUI.btn_continue.visible = this._curStatus == MAP_STATUS.PLAY_STATUS_SHOW_GAME;
            this._viewUI.box_bankerRate.visible = this._curStatus == MAP_STATUS.PLAY_STATUS_GET_BANKER;
            this._viewUI.btn_tanpai.visible = this._curStatus == MAP_STATUS.PLAY_STATUS_TANPAI;
            this._viewUI.box_betRate.visible = this._curStatus == MAP_STATUS.PLAY_STATUS_BET;
            if (this._curStatus == MAP_STATUS.PLAY_STATUS_SET_BANKER || this._curStatus == MAP_STATUS.PLAY_STATUS_GAME_START || this._curStatus == MAP_STATUS.PLAY_STATUS_PUSH_THREE
                || this._curStatus == MAP_STATUS.PLAY_STATUS_PUSH_TWO || this._curStatus == MAP_STATUS.PLAY_STATUS_COMPARE || this._curStatus == MAP_STATUS.PLAY_STATUS_SETTLE
                || this._curStatus == MAP_STATUS.PLAY_STATUS_GAME_SHUFFLE) {
                this._viewUI.box_timer.visible = false;
            }
            if (this._curStatus > MAP_STATUS.PLAY_STATUS_GAME_NONE && this._curStatus < MAP_STATUS.PLAY_STATUS_SHOW_GAME) {
                this._pageHandle.pushClose({ id: TongyongPageDef.PAGE_TONGYONG_MATCH, parent: this._game.uiRoot.HUD });
            }
            this._isPlaying = this._curStatus >= MAP_STATUS.PLAY_STATUS_GAME_SHUFFLE && this._curStatus < MAP_STATUS.PLAY_STATUS_SHOW_GAME;
            if (this._curStatus >= MAP_STATUS.PLAY_STATUS_GAME_SHUFFLE) {
                this._viewUI.paixie.ani_chupai.gotoAndStop(12);
            }
            this._viewUI.box_tips.visible = false;
            switch (this._curStatus) {
                case MAP_STATUS.PLAY_STATUS_GAME_NONE:// 准备阶段
                    this.initRoomConfig();
                    break;
                case MAP_STATUS.PLAY_STATUS_GAME_START:// 游戏开始
                    this._pageHandle.pushOpen({ id: MpniuniuPageDef.PAGE_NIUNIU_BEGIN, parent: this._game.uiRoot.HUD });
                    this._game.playSound(Path_game_mpniuniu.music_mpniuniu + "kaishi.mp3", false);
                    break;
                case MAP_STATUS.PLAY_STATUS_GAME_SHUFFLE:// 洗牌阶段
                    this._pageHandle.pushClose({ id: MpniuniuPageDef.PAGE_NIUNIU_BEGIN, parent: this._game.uiRoot.HUD });
                    this._viewUI.xipai.x = 640;
                    this._viewUI.xipai.y = 310;
                    this._viewUI.xipai.scaleX = 1;
                    this._viewUI.xipai.scaleY = 1;
                    this._viewUI.xipai.alpha = 1;
                    this._viewUI.xipai.rotation = 0;
                    this._viewUI.xipai.visible = true;
                    this._viewUI.xipai.ani_xipai.play(0, false);
                    this._isPlayXiPai = true;
                    break;
                case MAP_STATUS.PLAY_STATUS_PUSH_THREE:// 发3张阶段
                    this._viewUI.paixie.ani2.play(0, true);
                    break;
                case MAP_STATUS.PLAY_STATUS_GET_BANKER:// 开始抢庄
                    this._viewUI.txt_status.text = "开始抢庄";
                    break;
                case MAP_STATUS.PLAY_STATUS_SET_BANKER:// 定庄阶段
                    this._viewUI.box_bankerRate.visible = false;
                    break;
                case MAP_STATUS.PLAY_STATUS_BET:// 下注阶段
                    Laya.timer.clear(this, this.ranEffPos);
                    this._kuangView.removeSelf();
                    for (let i: number = 0; i < MpniuniuMgr.MAX_SEATS_COUNT; i++) {
                        if (this._bankerIndex == i) {
                            if (this._playerList[i].box_notBet.visible) {
                                this._playerList[i].box_bankerRate.visible = true;
                                this._playerList[i].box_notBet.visible = false;
                                this._playerList[i].img_bankerRate.skin = StringU.substitute(Path_game_mpniuniu.ui_mpniuniu + "bei_1.png");
                            }
                        } else {
                            this._playerList[i].box_bankerRate.visible = false;
                            this._playerList[i].box_notBet.visible = false;
                        }
                    }
                    this._viewUI.box_betRate.visible = this._bankerIndex != 0;
                    this._viewUI.txt_status.text = "开始下注";
                    break;
                case MAP_STATUS.PLAY_STATUS_PUSH_TWO:// 发2张阶段
                    this._viewUI.paixie.ani2.play(0, true);
                    Laya.timer.once(300 * this.getUnitCount(), this, this.onUpdateAniDeal);
                    break;
                case MAP_STATUS.PLAY_STATUS_TANPAI:// 摊牌阶段
                    break;
                case MAP_STATUS.PLAY_STATUS_COMPARE:// 比牌阶段
                    this._viewUI.txt_status.text = "比牌中";
                    break;
                case MAP_STATUS.PLAY_STATUS_SETTLE:// 结算阶段
                    this._viewUI.txt_status.text = "结算中";
                    this.addBankerWinEff();
                    let timeInternal = MONEY_NUM * MONEY_FLY_TIME;
                    Laya.timer.once(timeInternal, this, () => {
                        this.addBankerLoseEff();
                        this.updateMoney();
                    });
                    Laya.timer.once(2000, this, () => {
                        if (this._bankerLoseInfo.length == 2) {//庄家通杀
                            this._game.playSound(Path_game_mpniuniu.music_mpniuniu + "zjtongchi.mp3", false);
                            this._game.uiRoot.HUD.open(MpniuniuPageDef.PAGE_NIUNIU_TONGSHA);
                        }
                        else if (this._mainPlayerBenefit > 0) {
                            let rand = MathU.randomRange(1, 3);
                            this._game.playSound(StringU.substitute(PathGameTongyong.music_tongyong + "win{0}.mp3", rand), true);
                            this._game.uiRoot.HUD.open(MpniuniuPageDef.PAGE_NIUNIU_WIN);
                        } else {
                            let rand = MathU.randomRange(1, 4);
                            this._game.playSound(StringU.substitute(PathGameTongyong.music_tongyong + "lose{0}.mp3", rand), true);
                            this._game.uiRoot.HUD.open(MpniuniuPageDef.PAGE_NIUNIU_LOSE);
                        }
                    });

                    break;
                case MAP_STATUS.PLAY_STATUS_SETTLE_INFO:// 显示结算信息
                    this._niuStory.isReConnected = false;
                    break;
                case MAP_STATUS.PLAY_STATUS_SHOW_GAME:// 本局展示阶段
                    this._pageHandle.pushClose({ id: MpniuniuPageDef.PAGE_NIUNIU_TONGSHA, parent: this._game.uiRoot.HUD });
                    if (this._game.sceneObjectMgr.mainPlayer.playerInfo.money < this._room_config[1]) {
                        TongyongPageDef.ins.alertRecharge(StringU.substitute("老板，您的金币少于{0}哦~\n补充点金币去大杀四方吧~", this._room_config[1]), () => {
                            this._game.uiRoot.general.open(DatingPageDef.PAGE_CHONGZHI);
                        }, () => {
                        }, true, TongyongPageDef.TIPS_SKIN_STR["cz"]);
                    }

                    break;
            }

            this._pageHandle.updatePageHandle();//更新额外界面的开关状态
            this._pageHandle.reset();//清空额外界面存储数组
        }

        private chargeArgs(temp, flag): boolean {
            for (let i = 0; i < temp.length; i++) {
                if (flag) {
                    if (temp[i] != -1) {
                        return true;
                    }
                } else {
                    if (temp[i] != 0) {
                        return true;
                    }
                }
            }
            return false;
        }

        //按钮缓动回调
        protected onBtnTweenEnd(e: any, target: any): void {
            switch (target) {
                case this._viewUI.btn_spread://菜单
                    this.showMenu(true);
                    break;
                case this._viewUI.btn_cardType://牌型
                    this._game.uiRoot.general.open(MpniuniuPageDef.PAGE_NIUNIU_RULE, (page: MpniuniuRulePage) => {
                        page.dataSource = 1;
                    });
                    break;
                case this._viewUI.btn_rule://规则
                    this._game.uiRoot.general.open(MpniuniuPageDef.PAGE_NIUNIU_RULE);
                    break;
                case this._viewUI.btn_chongzhi://充值
                    this._game.uiRoot.general.open(DatingPageDef.PAGE_CHONGZHI);
                    break;
                case this._viewUI.btn_set://设置
                    this._game.uiRoot.general.open(TongyongPageDef.PAGE_TONGYONG_SETTING)
                    break;
                case this._viewUI.btn_tanpai://摊牌
                    this._game.network.call_mpniuniu_tanpai();
                    this._niuMgr.gaipai();
                    this._viewUI.btn_tanpai.visible = false;
                    break;
                case this._viewUI.btn_zhanji://战绩
                    this._game.uiRoot.general.open(TongyongPageDef.PAGE_TONGYONG_RECORD, (page) => {
                        page.dataSource = {
                            gameid: MpniuniuPageDef.GAME_NAME,
                            isCardRoomType: this._niuStory instanceof gamecomponent.story.StoryRoomCardBase,
                        };
                    });
                    break;
                case this._viewUI.btn_qifu://祈福
                    this._game.uiRoot.general.open(DatingPageDef.PAGE_QIFU);
                    break;
                case this._viewUI.btn_back://返回
                    if (this._niuMapInfo && this._niuMapInfo.GetPlayState() == 1) {
                        this._game.showTips("游戏尚未结束，请先打完这局哦~");
                        return;
                    }
                    this.clearClips();
                    this.resetData();
                    this.clearMapInfoListen();
                    this._game.sceneObjectMgr.leaveStory(true);
                    logd("玩家发送离开地图协议，离开房间")
                    // this.close();
                    break;
                case this._viewUI.btn_continue://继续游戏
                    if (this._game.sceneObjectMgr.mainUnit) {
                        if (this._game.sceneObjectMgr.mainUnit.GetMoney() < this._room_config[1]) {
                            TongyongPageDef.ins.alertRecharge(StringU.substitute("老板，您的金币少于{0}哦~\n补充点金币去大杀四方吧~", this._room_config[1]), () => {
                                this._game.uiRoot.general.open(DatingPageDef.PAGE_CHONGZHI);
                            }, () => {
                            }, true, TongyongPageDef.TIPS_SKIN_STR["cz"]);
                            return;
                        }
                    }

                    if (this._niuMapInfo instanceof MapInfo) {
                        this.clearClips();
                        this.resetUI();
                        this.resetData();
                        this._game.sceneObjectMgr.leaveStory();
                        logd("玩家发送离开地图协议")

                    } else {
                        this.onUpdateMapInfo();
                    }
                    break;
                case this._viewUI.btn_bankerRate0://不抢庄
                    this._game.network.call_mpniuniu_banker(0);
                    this._viewUI.box_bankerRate.visible = false;
                    this._viewUI.box_tips.visible = true;
                    this._viewUI.txt_tips.text = "等待其他玩家抢庄";
                    break;
                case this._viewUI.btn_bankerRate1://抢庄倍数1
                    this._game.network.call_mpniuniu_banker(1);
                    this._viewUI.box_bankerRate.visible = false;
                    this._viewUI.box_tips.visible = true;
                    this._viewUI.txt_tips.text = "等待其他玩家抢庄";
                    break;
                case this._viewUI.btn_bankerRate2://抢庄倍数2
                    this._game.network.call_mpniuniu_banker(2);
                    this._viewUI.box_bankerRate.visible = false;
                    this._viewUI.box_tips.visible = true;
                    this._viewUI.txt_tips.text = "等待其他玩家抢庄";
                    break;
                case this._viewUI.btn_bankerRate3://抢庄倍数3
                    this._game.network.call_mpniuniu_banker(3);
                    this._viewUI.box_bankerRate.visible = false;
                    this._viewUI.box_tips.visible = true;
                    this._viewUI.txt_tips.text = "等待其他玩家抢庄";
                    break;
                case this._viewUI.btn_betRate1://下注倍数1
                    this._game.network.call_mpniuniu_bet(this._betList[0]);
                    this._viewUI.box_betRate.visible = false;
                    this._viewUI.box_tips.visible = true;
                    this._viewUI.txt_tips.text = "等待其他玩家下注";
                    break;
                case this._viewUI.btn_betRate2://下注倍数2
                    this._game.network.call_mpniuniu_bet(this._betList[1]);
                    this._viewUI.box_betRate.visible = false;
                    this._viewUI.box_tips.visible = true;
                    this._viewUI.txt_tips.text = "等待其他玩家下注";
                    break;
                case this._viewUI.btn_betRate3://下注倍数3
                    this._game.network.call_mpniuniu_bet(this._betList[2]);
                    this._viewUI.box_betRate.visible = false;
                    this._viewUI.box_tips.visible = true;
                    this._viewUI.txt_tips.text = "等待其他玩家下注";
                    break;
                case this._viewUI.btn_betRate4://下注倍数4
                    this._game.network.call_mpniuniu_bet(this._betList[3]);
                    this._viewUI.box_betRate.visible = false;
                    this._viewUI.box_tips.visible = true;
                    this._viewUI.txt_tips.text = "等待其他玩家下注";
                    break;
                default:
                    break;
            }
        }

        protected onMouseClick(e: LEvent) {
            if (e.target != this._viewUI.btn_spread) {
                this.showMenu(false);
            }
        }

        showMenu(isShow: boolean) {
            if (isShow) {
                this._viewUI.box_menu.visible = true;
                this._viewUI.btn_spread.visible = false;
                this._viewUI.box_menu.y = -this._viewUI.box_menu.height;
                Laya.Tween.to(this._viewUI.box_menu, { y: 10 }, 300, Laya.Ease.circIn)
            } else {
                if (this._viewUI.box_menu.y >= 0) {
                    Laya.Tween.to(this._viewUI.box_menu, { y: -this._viewUI.box_menu.height }, 300, Laya.Ease.circIn, Handler.create(this, () => {
                        this._viewUI.btn_spread.visible = true;
                        this._viewUI.box_menu.visible = false;
                    }));
                }
            }
        }

        private onUpdateGameRound(): void {
            if (!this._niuMapInfo) return;
            if (this._niuMapInfo.GetRound() && this._niuMapInfo.GetCardRoomGameNumber()) {
                this._viewUI.txt_round.visible = true;
                this._viewUI.txt_round.text = StringU.substitute("局数：{0}/{1}", this._niuMapInfo.GetRound(), this._niuMapInfo.GetCardRoomGameNumber());
            } else {
                this._viewUI.txt_round.visible = false;
            }
        }

        private onUpdateGameNo(): void {
            if (!this._niuMapInfo) return;
            if (this._niuMapInfo.GetGameNo()) {
                this._viewUI.box_id.visible = true;
                this._viewUI.txt_id.text = "牌局号：" + this._niuMapInfo.GetGameNo();
                // if (this.isCardRoomType)
                //     this._viewUI.txt_id.text = "房间号：" + this._niuMapInfo.GetCardRoomId();
            }
        }

        private _qifuTypeImgUrl: string;
        private qifuFly(dataSource: any): void {
            if (!dataSource) return;
            let dataInfo = dataSource;
            if (!this._game.sceneObjectMgr || !this._game.sceneObjectMgr.mainUnit || this._game.sceneObjectMgr.mainUnit.GetIndex() != dataSource.qifu_index) return;
            this._game.qifuMgr.showFlayAni(this._viewUI.view0.view_icon, this._viewUI, dataSource, (dataInfo) => {
                //相对应的玩家精灵做出反应
                this._qifuTypeImgUrl = TongyongUtil.getQFTypeImg(dataInfo.qf_id);
                this.onUpdateUnit(dataInfo.qifu_index);
            });
        }

        private initView(): void {
            //界面UI
            this._kuangView = new ui.nqp.game_ui.tongyong.effect.SuiJiUI();
            this._viewUI.box_tips.visible = false;
            this._viewUI.box_status.visible = false;
            this._viewUI.box_bankerRate.visible = false;
            this._viewUI.box_betRate.visible = false;
            this._viewUI.box_timer.visible = false;
            this._viewUI.box_id.visible = false;
            this._viewUI.xipai.visible = false;
            this._viewUI.paixie.ani2.gotoAndStop(0);
            this._viewUI.paixie.cards.visible = false;
            this._viewUI.paixie.ani_chupai.stop();
            this._viewUI.box_menu.visible = false;
            this._viewUI.box_menu.zOrder = 99;
            this._viewUI.txt_round.visible = false;

            this._playerList = [];
            for (let i: number = 0; i < MpniuniuMgr.MAX_SEATS_COUNT; i++) {
                this._playerList.push(this._viewUI["view" + i])
            }
            for (let i: number = 0; i < MpniuniuMgr.MAX_SEATS_COUNT; i++) {
                this._playerList[i].visible = false;
                this._playerList[i].box_bankerRate.visible = false;
                this._playerList[i].box_betRate.visible = false;
                this._playerList[i].box_notBet.visible = false;
                this._playerList[i].img_isReady.visible = false;
                this._playerList[i].view_icon.clip_money.visible = false;
                this._playerList[i].view_icon.img_banker.visible = false;
                if (i > 0) {
                    this._playerList[i].box_cardType.visible = false;
                    this._playerList[i].img_yiwancheng.visible = false;
                }
            }

            //主玩家UI
            this._viewUI.box_showCard.visible = false;
            this._viewUI.btn_tanpai.visible = false;
            this._viewUI.btn_continue.visible = false;
        }

        private initRoomConfig(): void {
            if (this._niuStory.maplv) {
                this._room_config = ROOM_CONFIG[this._niuStory.maplv];
                let str = "";
                if (this._niuStory.maplv == Web_operation_fields.GAME_ROOM_CONFIG_MPNIUNIU_1) {
                    str = "房间：新手场  底注：";
                } else if (this._niuStory.maplv == Web_operation_fields.GAME_ROOM_CONFIG_MPNIUNIU_2) {
                    str = "房间：小资场  底注：";
                } else if (this._niuStory.maplv == Web_operation_fields.GAME_ROOM_CONFIG_MPNIUNIU_3) {
                    str = "房间：老板场  底注：";
                } else if (this._niuStory.maplv == Web_operation_fields.GAME_ROOM_CONFIG_MPNIUNIU_4) {
                    str = "房间：富豪场  底注：";
                }
                this._viewUI.txt_base.text = str + this._room_config[0];
                if (this._niuStory.maplv != Web_operation_fields.GAME_ROOM_CONFIG_CARD_ROOM) {
                    let playerMoney = this._game.sceneObjectMgr.mainPlayer.playerInfo.money;
                    this._viewUI.btn_bankerRate1.disabled = !(playerMoney >= this._room_config[0] * 30);
                    this._viewUI.btn_bankerRate2.disabled = !(playerMoney >= this._room_config[0] * 60);
                    this._viewUI.btn_bankerRate3.disabled = !(playerMoney >= this._room_config[0] * 90);
                }
            }
        }

        //重置UI
        private resetUI(): void {
            for (let i: number = 0; i < MpniuniuMgr.MAX_SEATS_COUNT; i++) {
                this._playerList[i].box_bankerRate.visible = false;
                this._playerList[i].box_betRate.visible = false;
                this._playerList[i].box_notBet.visible = false;
                this._playerList[i].img_isReady.visible = false;
                this._playerList[i].view_icon.clip_money.visible = false;
                this._playerList[i].view_icon.img_banker.visible = false;
                if (i > 0) {
                    this._playerList[i].box_cardType.visible = false;
                    this._playerList[i].img_yiwancheng.visible = false;
                }
            }

            //主玩家UI
            this._viewUI.box_showCard.visible = false;
            this._viewUI.btn_tanpai.visible = false;
            this._viewUI.btn_continue.visible = false;

            //界面UI
            this._viewUI.box_tips.visible = false;
            this._viewUI.box_bankerRate.visible = false;
            this._viewUI.box_betRate.visible = false;
            this._viewUI.box_timer.visible = false;
            this._viewUI.paixie.cards.visible = false;
            this._viewUI.paixie.ani_chupai.stop();
        }

        private resetData(): void {
            this._battleIndex = -1;
            this._getBankerCount = 0;
            this._bankerRateInfo = [];
            this._bankerWinInfo = [];
            this._bankerLoseInfo = [];
            this._betList = [];
            this._bankerList = [];
            this._room_config = [];
        }

        private clearMapInfoListen(): void {
            this._game.sceneObjectMgr.off(MpniuniuMapInfo.EVENT_STATUS_CHECK, this, this.onUpdateStatus);
            this._game.sceneObjectMgr.off(MpniuniuMapInfo.EVENT_BATTLE_CHECK, this, this.onUpdateBattle);
            this._game.sceneObjectMgr.off(MpniuniuMapInfo.EVENT_GAME_ROUND_CHANGE, this, this.onUpdateGameRound);
            this._game.sceneObjectMgr.off(MpniuniuMapInfo.EVENT_GAME_NO, this, this.onUpdateGameNo);//牌局号
            this._game.sceneObjectMgr.off(MpniuniuMapInfo.EVENT_COUNT_DOWN, this, this.onUpdateCountDown);//倒计时更新
            this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_ADD_UNIT, this, this.onUnitAdd);
            this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_REMOVE_UNIT, this, this.onUnitRemove);
            this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_UNIT_MONEY_CHANGE, this, this.onUpdateUnit);
            this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_UNIT_CHANGE, this, this.onUpdateUnit);
            this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_UNIT_ACTION, this, this.onUpdateUnit);
            this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_UNIT_QIFU_TIME_CHANGE, this, this.onUpdateUnit);
            this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_MAPINFO_CHANGE, this, this.onUpdateMapInfo);
            Laya.Tween.clearAll(this);
            Laya.timer.clearAll(this);
        }

        public close(): void {
            if (this._viewUI) {
                this._viewUI.btn_spread.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_cardType.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_back.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_rule.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_chongzhi.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_set.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_continue.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_bankerRate0.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_bankerRate1.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_bankerRate2.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_bankerRate3.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_betRate1.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_betRate2.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_betRate3.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_betRate4.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_tanpai.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_zhanji.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_qifu.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.xipai.ani_xipai.off(LEvent.COMPLETE, this, this.onWashCardOver);
                if (this._niuMgr) {
                    this._niuMgr.off(MpniuniuMgr.DEAL_OVER, this, this.onUpdateAniDeal);
                }

                this._game.sceneObjectMgr.off(MpniuniuMapInfo.EVENT_STATUS_CHECK, this, this.onUpdateStatus);
                this._game.sceneObjectMgr.off(MpniuniuMapInfo.EVENT_BATTLE_CHECK, this, this.onUpdateBattle);
                this._game.sceneObjectMgr.off(MpniuniuMapInfo.EVENT_GAME_ROUND_CHANGE, this, this.onUpdateUnit);//继续游戏状态改变后
                this._game.sceneObjectMgr.off(MpniuniuMapInfo.EVENT_GAME_NO, this, this.onUpdateGameNo);//牌局号
                this._game.sceneObjectMgr.off(MpniuniuMapInfo.EVENT_COUNT_DOWN, this, this.onUpdateCountDown);//倒计时更新

                this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_ADD_UNIT, this, this.onUnitAdd);
                this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_REMOVE_UNIT, this, this.onUnitRemove);
                this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_UNIT_MONEY_CHANGE, this, this.onUpdateUnit);
                this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_UNIT_CHANGE, this, this.onUpdateUnit);
                this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_UNIT_ACTION, this, this.onUpdateUnit);
                this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_MAPINFO_CHANGE, this, this.onUpdateMapInfo);
                this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_UNIT_QIFU_TIME_CHANGE, this, this.onUpdateUnit);

                this._game.qifuMgr.off(QiFuMgr.QIFU_FLY, this, this.qifuFly);
                Laya.Tween.clearAll(this);
                Laya.timer.clearAll(this);
                this.clearClips();
                this.resetData();
                this.clearMapInfoListen();
                this._game.stopAllSound();
                this._game.stopMusic();
                this._kuangView && this._kuangView.removeSelf();
                this.clearBeiClip();
            }
            super.close();
        }
    }
}