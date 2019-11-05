/**
* name 牛牛剧情
*/
module gamempniuniu.story {
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
	export class MpniuniuStory extends gamecomponent.story.StoryNormalBase {
		private _niuMgr: MpniuniuMgr;
		private _isFaPai: number;
		private _bankerIndex: number;
		private _niuMapInfo: MpniuniuMapInfo;
		private _curStatus: number;
		private _isFanPai: boolean;
		private _infoList: Array<any> = [];

		constructor(v: Game, mapid: string, maplv: number) {
			super(v, mapid, maplv);
			this._last_maplv = maplv;
			this.init();
		}

		set mapLv(lv: number) {
			this.maplv = lv;
		}

		get mapLv() {
			return this.maplv;
		}

		get niuMgr() {
			return this._niuMgr;
		}

		get isFaPai() {
			return this._isFaPai;
		}

		init() {
			super.init();
			if (!this._niuMgr) {
				this._niuMgr = new MpniuniuMgr(this._game);
			}
			this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_LOAD_MAP, this, this.onIntoNewMap);
			this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_MAPINFO_CHANGE, this, this.onMapInfoChange);
			this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_MAIN_UNIT_CHANGE, this, this.onUpdateCardInfo);
			this._game.sceneObjectMgr.on(MpniuniuMapInfo.EVENT_BATTLE_CHECK, this, this.onUpdateBattle);
			this._game.sceneObjectMgr.on(MpniuniuMapInfo.EVENT_STATUS_CHECK, this, this.onUpdateState);

			this.onIntoNewMap();
		}

		private createObj() {
			let card = this._game.sceneObjectMgr.createOfflineObject(SceneRoot.CARD_MARK, MpniuniuData) as MpniuniuData;
			card.pos = new Vector2(980, 190);
			return card;
		}

		private onIntoNewMap(info?: MapAssetInfo): void {
			if (!info) return;
			this.onMapInfoChange();
			this._game.uiRoot.closeAll();
			this._game.uiRoot.HUD.open(MpniuniuPageDef.PAGE_NIUNIU_MAP);
		}

		private onMapInfoChange(): void {
			let mapinfo = this._game.sceneObjectMgr.mapInfo;
			this._niuMapInfo = mapinfo as MpniuniuMapInfo;
			if (mapinfo) {
				this.onUpdateState();
				this.onUpdateCardInfo();
				this.onUpdateBattle();
			} else {
				this._niuMgr.offlineUnit = this._offlineUnit;
			}
		}

		private onUpdateState(): void {
			// let mapinfo: niuniu.data.NiuniuMapInfo = this._game.sceneObjectMgr.mapInfo as niuniu.data.NiuniuMapInfo;
			if (!this._niuMapInfo) return;
			let mapStatus = this._niuMapInfo.GetMapState();
			if (this._curStatus == mapStatus) return;
			this._curStatus = mapStatus;
			let mainUnit: Unit = this._game.sceneObjectMgr.mainUnit;
			if (!mainUnit || !mainUnit.GetIndex()) return;
			switch (this._curStatus) {
				case MAP_STATUS.PLAY_STATUS_GAME_NONE:// 准备阶段

					break;
				case MAP_STATUS.PLAY_STATUS_GAME_SHUFFLE:// 洗牌阶段

					break;
				case MAP_STATUS.PLAY_STATUS_GAME_START:// 游戏开始
					this._isFaPai = 0;
					break;
				case MAP_STATUS.PLAY_STATUS_PUSH_THREE:// 发3张阶段
					this.dealCards3();
					break;
				case MAP_STATUS.PLAY_STATUS_GET_BANKER:// 开始抢庄

					break;
				case MAP_STATUS.PLAY_STATUS_SET_BANKER:// 定庄阶段

					break;
				case MAP_STATUS.PLAY_STATUS_BET:// 下注阶段
					break;
				case MAP_STATUS.PLAY_STATUS_PUSH_TWO:// 发2张阶段
					this.dealCards2(false);
					break;
				case MAP_STATUS.PLAY_STATUS_TANPAI:// 摊牌阶段
					break;
				case MAP_STATUS.PLAY_STATUS_COMPARE:// 比牌阶段
					this._niuMgr.gaipai();
					break;
				case MAP_STATUS.PLAY_STATUS_SETTLE:// 结算阶段

					break;
				case MAP_STATUS.PLAY_STATUS_SETTLE_INFO:// 显示结算信息

					break;
				case MAP_STATUS.PLAY_STATUS_SHOW_GAME:// 本局展示阶段
					this._isFaPai = 0;
					this._index = 0;
					this._niuMgr.resetCardsIndex();
					break;
			}
		}

		//发3张
		private dealCards3(): void {
			if (!this._niuMapInfo) return;
			let mainUnit = this._game.sceneObjectMgr.mainUnit;
			if (!mainUnit || !mainUnit.GetIndex()) return;
			if (this._isFaPai > 0) return;
			let idx = mainUnit.GetIndex();
			let max = 5;
			let cards = [];
			for (let index = 0; index < max; index++) {
				let posIdx = (idx + index) % max == 0 ? max : (idx + index) % max;
				let unit = this._game.sceneObjectMgr.getUnitByIdx(posIdx);
				let mainCards = this._game.sceneObjectMgr.mainPlayer.playerInfo.cards;
				if (unit) {
					if (unit.GetIndex() == idx) {
						cards = cards.concat(mainCards);
					} else {
						cards = cards.concat([0, 0, 0]);
					}
					this._niuMgr.setCardsIndex(unit.GetIndex());
				}
			}
			let handle = new Handler(this, this.createObj);
			this._niuMgr.Init(cards, handle);
			this._niuMgr.sort();
			this._niuMgr.fapai();
			this._niuMgr.fanpai();
			this._isFaPai = 1;
		}

		//发2张
		private dealCards2(isReConnected: boolean): void {
			if (!this._niuMapInfo) return;
			let mainUnit = this._game.sceneObjectMgr.mainUnit;
			if (!mainUnit || !mainUnit.GetIndex()) return;
			if (this._isFaPai > 1) return;
			let idx = mainUnit.GetIndex();
			let max = 5;
			let cards = [];
			let count = 0;
			for (let index = 0; index < max; index++) {
				let posIdx = (idx + index) % max == 0 ? max : (idx + index) % max;
				let unit = this._game.sceneObjectMgr.getUnitByIdx(posIdx);
				let mainCards = this._game.sceneObjectMgr.mainPlayer.playerInfo.cards;
				if (unit) {
					if (unit.GetIdentity() == 1) {
						this._bankerIndex = index;
					}
					if (unit.GetIndex() == idx) {
						cards = mainCards.slice(3, 5);
					} else {
						cards = [0, 0];
					}
					let handle = new Handler(this, this.createObj);
					if (isReConnected) {
						this._niuMgr.refapai2(cards, handle, idx, posIdx, count, this.getPlayerOnSeat());
					} else {
						this._niuMgr.fapai2(cards, handle, idx, posIdx, count, this.getPlayerOnSeat());
					}
					count++;
				}
			}
			this._isFaPai = 2;
		}

		//断线重连,重发下牌
		private onUpdateCardInfo(): void {
			if (!this._niuMapInfo) return;
			let mainUnit: Unit = this._game.sceneObjectMgr.mainUnit;
			if (!mainUnit || !mainUnit.GetIndex()) return;
			if (!this._isReConnected) return;
			if (this._isFaPai > 0) return;
			let status = this._niuMapInfo.GetMapState();
			let idx = this._game.sceneObjectMgr.mainUnit.GetIndex();
			let max = 5;
			let cards = [];
			if (status >= MAP_STATUS.PLAY_STATUS_PUSH_THREE && status < MAP_STATUS.PLAY_STATUS_PUSH_TWO) {
				for (let index = 0; index < max; index++) {
					let posIdx = (idx + index) % max == 0 ? max : (idx + index) % max;
					let unit = this._game.sceneObjectMgr.getUnitByIdx(posIdx);
					let mainCards = this._game.sceneObjectMgr.mainPlayer.playerInfo.cards;
					if (unit) {
						if (unit.GetIndex() == idx) {
							cards = cards.concat(mainCards);
						} else {
							cards = cards.concat([0, 0, 0]);
						}
						this._niuMgr.setCardsIndex(unit.GetIndex());
					}
				}
				let handle = new Handler(this, this.createObj);
				this._niuMgr.Init(cards, handle);
				this._niuMgr.sort();
				this._isFaPai = 1;
			} else if (status >= MAP_STATUS.PLAY_STATUS_PUSH_TWO) {
				for (let index = 0; index < max; index++) {
					let posIdx = (idx + index) % max == 0 ? max : (idx + index) % max;
					let unit = this._game.sceneObjectMgr.getUnitByIdx(posIdx);
					let mainCards = this._game.sceneObjectMgr.mainPlayer.playerInfo.cards;
					if (unit) {
						if (unit.GetIndex() == idx) {
							cards = cards.concat(mainCards.slice(0, 3));
						} else {
							cards = cards.concat([0, 0, 0]);
						}
						this._niuMgr.setCardsIndex(unit.GetIndex());
					}
				}
				let handle = new Handler(this, this.createObj);
				this._niuMgr.Init(cards, handle);
				this._niuMgr.sort();
				this.dealCards2(true);
				this._isFaPai = 2;
			}
			if (status > MAP_STATUS.PLAY_STATUS_TANPAI) {
				this._niuMgr.regaipai();
			} else {
				this._niuMgr.refapai();
			}
		}

		//战斗结构体 出牌
		private _index: number = 0;
		private onUpdateBattle(): void {
			if (!this._niuMapInfo) return;
			let battleInfoMgr = this._niuMapInfo.battleInfoMgr;
			let unitNum = this.getPlayerOnSeat();
			for (let i: number = 0; i < battleInfoMgr.info.length; i++) {
				let info = battleInfoMgr.info[i] as gamecomponent.object.BattleInfoBase;
				if (info instanceof gamecomponent.object.BattleInfoPlayCard) {
					if (i > this._index) {
						this._infoList.push(info);
						this._niuMgr.setValue(info);
						this._index = i;
					}
				}
			}
		}

		//断线重连,重发翻牌
		private onUpdateFanPai(): void {
			if (!this.isReConnected) return;
			if (!this._infoList.length) return;
			if (this._isFanPai) return;
			for (let i = 0; i < this._infoList.length; i++) {
				this._niuMgr.setValue(this._infoList[i]);
			}
			this._isFanPai = true;
		}

		private getPlayerOnSeat(): number {
			let unitNum = 0
			for (let index = 0; index < 5; index++) {
				let unit = this._game.sceneObjectMgr.getUnitByIdx(index + 1)
				if (unit) {
					unitNum++;
				}
			}
			return unitNum;
		}

		createofflineUnit() {
			//创建假的地图和精灵
			let unitOffline = new UnitOffline(this._game.sceneObjectMgr);
			if (this._game.sceneObjectMgr.mainPlayer) {
				unitOffline.SetStr(UnitField.UNIT_STR_NAME, this._game.sceneObjectMgr.mainPlayer.playerInfo.nickname);
				unitOffline.SetStr(UnitField.UNIT_STR_HEAD_IMG, this._game.sceneObjectMgr.mainPlayer.playerInfo.headimg);
				unitOffline.SetDouble(UnitField.UNIT_INT_MONEY, this._game.sceneObjectMgr.mainPlayer.playerInfo.money);
				unitOffline.SetUInt32(UnitField.UNIT_INT_QI_FU_END_TIME, this._game.sceneObjectMgr.mainPlayer.playerInfo.qifu_endtime);
				unitOffline.SetUInt32(UnitField.UNIT_INT_QI_FU_TYPE, this._game.sceneObjectMgr.mainPlayer.playerInfo.qifu_type);
				unitOffline.SetUInt32(UnitField.UNIT_INT_VIP_LEVEL, this._game.sceneObjectMgr.mainPlayer.playerInfo.vip_level);
			}
			unitOffline.SetUInt16(UnitField.UNIT_INT_UINT16, 0, 1);

			this._offlineUnit = unitOffline;
		}

		enterMap() {
			//各种判断
			if (this.mapinfo) return false;
			if (!this.maplv) {
				this.maplv = this._last_maplv;
			}
			this._game.network.call_match_game(this._mapid, this.maplv);
			return true;
		}

		leavelMap() {
			//各种判断
			this._game.network.call_leave_game();
			return true;
		}

		clear() {
			this._game.sceneObjectMgr.off(MpniuniuMapInfo.EVENT_BATTLE_CHECK, this, this.onUpdateBattle);
			this._game.sceneObjectMgr.off(MpniuniuMapInfo.EVENT_STATUS_CHECK, this, this.onUpdateState);
			this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_LOAD_MAP, this, this.onIntoNewMap);
			this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_MAIN_UNIT_CHANGE, this, this.onUpdateCardInfo);
			this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_MAPINFO_CHANGE, this, this.onMapInfoChange);
			this._niuMapInfo = null;
			if (this._niuMgr) {
				this._niuMgr.clear();
				this._niuMgr = null;
			}
		}
	}
}