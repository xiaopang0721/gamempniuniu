/**
* name 
*/
module gamempniuniu.manager {
	const enum CARD_TYPE {
		NOT_NIU = 0, //没牛
		NIU_1 = 1, //牛一
		NIU_2 = 2, //牛二
		NIU_3 = 3, //牛三
		NIU_4 = 4, //牛四
		NIU_5 = 5, //牛五
		NIU_6 = 6, //牛六
		NIU_7 = 7, //牛七
		NIU_8 = 8, //牛八
		NIU_9 = 9, //牛九
		NIU_NIU = 10, //牛牛
		SILVER_NIU = 11, //银牛
		GOLD_NIU = 12, //金牛
		BOMB = 13, //炸弹
		SMALL_NIU = 14, //五小牛
	}

	const enum MULTIPLE {
		RATE_1 = 1, //没牛——牛六	1倍
		RATE_2 = 2, //牛七——牛八	2倍
		RATE_3 = 3, //牛九		  3倍
		RATE_4 = 4, //牛牛以上		4倍
	}


	export class MpniuniuMgr extends gamecomponent.managers.PlayingCardMgrBase<MpniuniuData>{
		static readonly MAPINFO_OFFLINE: string = "NiuMgr.MAPINFO_OFFLINE";//假精灵
		static readonly DEAL_OVER: string = "NiuMgr.DEAL_OVER";//发牌结束
		static readonly MAX_SEATS_COUNT = 5; //最大座位数
		static readonly MAX_CARDS_COUNT = 5; //最大手牌数

		private _bankerIndex: number;//庄家位置
		private _offlineUnit: UnitOffline;//假精灵信息
		private _isReKaiPai: boolean = true;
		private _isReconnect: boolean = true;
		private _isGaiPai: boolean = false;
		private _cardsIndex: Array<number> = [];//牌的归属位置

		constructor(game: Game) {
			super(game)
		}

		get offlineUnit() {
			return this._offlineUnit;
		}

		set offlineUnit(v) {
			this._offlineUnit = v;
			this.event(MpniuniuMgr.MAPINFO_OFFLINE)
		}

		get isReconnect() {
			return this._isReconnect;
		}

		set isReconnect(v) {
			this._isReconnect = v;
		}

		get isGaiPai() {
			return this._isGaiPai;
		}

		//对牌进行排序
		SortCards(cards: any[]) {
			if (!cards) return;
			cards.sort((a: MpniuniuData, b: MpniuniuData) => {
				return a.Compare(b, true);
			});
		}

		// 根据牌获取牌型
		// 获得牛数
		private getNiubyCards(cards): number {
			let lave: number = 0; //余数
			for (let i = 0; i < cards.length; i++) {
				lave = lave + cards[i].GetCount();
			}
			lave = lave % 10;
			for (let i = 0; i < cards.length - 1; i++) {
				for (let j = i + 1; j < cards.length; j++) {
					if ((cards[i].GetCount() + cards[j].GetCount()) % 10 == lave) {
						if (lave == 0) {
							return 10;
						} else {
							return lave;
						}
					}
				}
			}
			return 0;
		}

		public checkCardsRate(cardtype): number {
			let cardRate = MULTIPLE.RATE_1;
			if (cardtype >= 10) {
				cardRate = MULTIPLE.RATE_4;
				return cardRate;
			}
			if (cardtype == 9) {
				cardRate = MULTIPLE.RATE_3;
				return cardRate;
			}
			if (cardtype > 6 && cardtype < 9) {
				cardRate = MULTIPLE.RATE_2;
				return cardRate;
			}
			return cardRate;
		}

		public checkCardsType(cards): number {
			this.SortCards(cards);
			let cardtype = CARD_TYPE.NOT_NIU;
			if (this.is_small_niu(cards)) {
				cardtype = CARD_TYPE.SMALL_NIU;
				return cardtype
			}
			else if (this.is_bomb(cards)) {
				cardtype = CARD_TYPE.BOMB;
				return cardtype
			}
			else if (this.is_gold_niu(cards)) {
				cardtype = CARD_TYPE.GOLD_NIU;
				return cardtype
			}
			else if (this.is_silver_niu(cards)) {
				cardtype = CARD_TYPE.SILVER_NIU;
				return cardtype
			}
			cardtype = this.getNiubyCards(cards)
			return cardtype;
		}
		// 是否五小牛
		private is_small_niu(cards): boolean {
			let sum = 0;
			for (let i = 0; i < cards.length; i++) {
				sum = sum + cards[i].GetCount();
			}
			if (sum <= 10)
				return true
			else
				return false
		}
		// 是否炸弹
		private is_bomb(cards): boolean {
			if (cards[0].GetCardVal() == cards[3].GetCardVal())
				return true;
			else if (cards[1].GetCardVal() == cards[4].GetCardVal())
				return true;
			else
				return false;
		}
		// 是否五花牛
		private is_gold_niu(cards): boolean {
			if (cards[4].GetCardVal() > 10)
				return true;
			else
				return false;
		}
		// 是否四花牛
		private is_silver_niu(cards): boolean {
			if (cards[3].GetCardVal() > 10 && cards[4].GetCardVal() == 10)
				return true;
			else
				return false;
		}

		// 自己的牌型
		checkMyCards(): number {
			let cards = [];
			let type = 0;
			for (let i: number = 0; i < 5; i++) {
				cards.push(this._cards[i]);
			}
			type = this.checkCardsType(cards);
			return type;
		}

		sort() {
			let cards = this._cards;//牌堆
			let idx = this._game.sceneObjectMgr.mainUnit.GetIndex();
			let mainUnit: Unit = this._game.sceneObjectMgr.mainUnit;
			let max = MpniuniuMgr.MAX_SEATS_COUNT;
			let count = 0;
			for (let index = 0; index < max; index++) {//ui座位
				let posIdx = (idx + index) % max == 0 ? max : (idx + index) % max;
				let unit = this._game.sceneObjectMgr.getUnitByIdx(posIdx);
				if (unit) {
					for (let i = 0; i < 3; i++) {//手牌
						let card = cards[count * 3 + i] as MpniuniuData;
						if (card) {
							card.myOwner(posIdx, mainUnit == unit, mainUnit.GetIndex(), i);
							card.index = i;
							card.sortScore = max - i;
						}
					}
					count++;
				}
			}
		}

		//根据实际位置获取精灵在UI上的逻辑位置
		private getUnitUIPos(_index): number {
			//主玩家的座位
			let idx = this._game.sceneObjectMgr.mainUnit.GetIndex();
			let max = MpniuniuMgr.MAX_SEATS_COUNT;
			for (let index = 0; index < max; index++) {
				let posIdx = (idx + index) % max == 0 ? max : (idx + index) % max;
				let unit = this._game.sceneObjectMgr.getUnitByIdx(posIdx)
				if (unit && posIdx == _index) {
					return index;
				}
			}
			return -1;
		}

		setCardsIndex(index: number) {
			this._cardsIndex.push(this.getUnitUIPos(index));
		}

		resetCardsIndex() {
			this._cardsIndex = [];
			this._isGaiPai = false;
		}

		setValue(info: any) {
			if (!this._cards.length) return;
			let mainUnit: Unit = this._game.sceneObjectMgr.mainUnit;
			if (!mainUnit || !mainUnit.GetIndex()) return;
			let cards = this._cards;//牌堆
			let mainIndex = mainUnit.GetIndex();
			let unitnum = this.getPlayerOnSeat();
			let max = 5;
			for (let i = 0; i < max; i++) {//ui座位
				let posIdx = (mainIndex + i) % max == 0 ? max : (mainIndex + i) % max;
				let unit = this._game.sceneObjectMgr.getUnitByIdx(posIdx);
				if (unit && unit.GetIndex() == info.SeatIndex) {
					let _cardsInfo = info.Cards;
					let _cards = [];
					for (let k: number = 0; k < _cardsInfo.length; k++) {
						_cards.push(_cardsInfo[k]);//用新数组存下来，方便调整牌序
					}
					let isNiu = this.checkCardsType(_cards);
					let uiPos = this._cardsIndex.indexOf(this.getUnitUIPos(unit.GetIndex()));
					_cards = this.sortCardsToNiu(_cards);
					for (let j = 0; j < max; j++) {//手牌
						let card: MpniuniuData;
						if (j < 3) {
							card = this._cards[uiPos * 3 + j] as MpniuniuData;
						} else {
							card = this._cards[unitnum * 3 + uiPos * 2 + (j - 3)] as MpniuniuData;
						}
						let _card = _cards[j];
						if (card) {
							card.Init(_card.GetVal());
							card.index = j;
							card.sortScore = max - j;
							if (isNiu && j > 2) {
								if (!card.targe_pos) {
									card.targe_pos = new Vector2();
								}
								card.isFinalPos = false;
								card.targe_pos.y = card.targe_pos.y - 20;
							}
						}
					}
					this.kaipai(uiPos);
					this.moveCard(uiPos);
				}
			}
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

		sortCardsToNiu(cards): Array<MpniuniuData> {
			let lave = 0; //余数
			let index1 = 0;
			let index2 = 0;
			let newCards = cards;
			for (let i: number = 0; i < newCards.length; i++) {
				lave = lave + newCards[i].GetCount();
			}
			lave = lave % 10;
			for (let i: number = 0; i < newCards.length - 1; i++) {
				for (let j: number = i + 1; j < newCards.length; j++) {
					if ((newCards[i].GetCount() + newCards[j].GetCount()) % 10 == lave) {
						index1 = i;
						index2 = j;
					}
				}
			}
			if (index1 + index2 == 0) return newCards;
			if (index1 < 3 && index2 < 3) {
				let a = newCards[3];
				newCards[3] = newCards[index1];
				newCards[index1] = a;
				a = newCards[4];
				newCards[4] = newCards[index2];
				newCards[index2] = a;
			}
			if (index1 < 3 && index2 >= 3) {
				let index = 0;
				if (index2 == 3) {
					index = 4;
				}
				else if (index2 == 4) {
					index = 3;
				}
				let a = newCards[index];
				newCards[index] = newCards[index1];
				newCards[index1] = a;
			}
			if (index2 < 3 && index1 >= 3) {
				let index = 0;
				if (index1 == 3) {
					index = 4;
				}
				else if (index1 == 4) {
					index = 3;
				}
				let a = newCards[index];
				newCards[index] = newCards[index2];
				newCards[index2] = a;
			}

			return newCards;
		}

		/****************正常流程 专用方法*****************/
		//发2张
		fapai2(vals: number[], create_fun: Handler, mainIdx: number, ownerIdx: number, count: number, unitCount: number) {
			for (let i = 0; i < vals.length; i++) {
				let card: MpniuniuData;
				card = create_fun.run();
				this._cards.push(card)
				card.Init(vals[i]);
				card.sortScore = 2 - i;
				card.myOwner(ownerIdx, mainIdx == ownerIdx, mainIdx, 3 + i);
				Laya.timer.once(150 * count + i * unitCount * 150, this, () => {
					this._game.playSound(PathGameTongyong.music_tongyong + "fapai.mp3", false);
					card && card.fapai();
				});
				if (mainIdx == ownerIdx) {
					Laya.timer.once(300 + i * unitCount * 150, this, () => {
						card && card.fanpai();
					});
				}
			}
		}

		//发3张
		fapai() {
			let count = 0;
			let counter = 0;
			for (let j: number = 0; j < 3; j++) {
				for (let i: number = 0; i < this._cards.length / 3; i++) {
					Laya.timer.once(130 * count, this, () => {
						this._game.playSound(PathGameTongyong.music_tongyong + "fapai.mp3", false);
						let card = this._cards[i * 3 + j];
						if (!card) return;
						card.fapai();
						counter++;
						if (counter >= this._cards.length) {
							this.event(MpniuniuMgr.DEAL_OVER);
						}
					});
					count++;
				}
			}
		}

		//盖牌(主玩家放到桌上变小牌)
		gaipai() {
			let unitnum = this.getPlayerOnSeat();
			if (this._isGaiPai) return;
			for (let i: number = 0; i < 5; i++) {
				let card: MpniuniuData;
				if (i < 3) {
					card = this._cards[i] as MpniuniuData;
				} else {
					card = this._cards[unitnum * 3 + (i - 3)] as MpniuniuData;
				}
				if (!card) return;
				card.yipai();
			}
			this._isGaiPai = true;
		}

		//翻牌
		fanpai() {
			Laya.timer.once(150 * this._cards.length, this, () => {
				for (let i: number = 0; i < 3; i++) {
					let card = this._cards[i];
					if (!card) return;
					card.fanpai();
				}
			});
		}

		//开牌
		kaipai(index: number) {
			let unitnum = this.getPlayerOnSeat();
			for (let i = 0; i < 5; i++) {
				let card: MpniuniuData;
				if (i < 3) {
					card = this._cards[index * 3 + i] as MpniuniuData;
				} else {
					card = this._cards[unitnum * 3 + index * 2 + (i - 3)] as MpniuniuData;
				}
				if (!card) return;
				card.fanpai();
			}
		}

		//牛牌最后两张向下移动
		moveCard(index: number) {
			let unitnum = this.getPlayerOnSeat();
			Laya.timer.once(500, this, () => {
				for (let i = 0; i < 5; i++) {
					let card: MpniuniuData;
					if (i < 3) {
						card = this._cards[index * 3 + i] as MpniuniuData;
					} else {
						card = this._cards[unitnum * 3 + index * 2 + (i - 3)] as MpniuniuData;
					}
					if (!card) return;
					card.moveCard();
				}
			})
		}

		// 清理指定玩家卡牌对象
		clearCardObject(index: number): void {
			this._game.sceneObjectMgr.ForEachObject((obj: any) => {
				if (obj instanceof MpniuniuData) {
					if (obj.GetOwnerIdx() == index) {
						this._game.sceneObjectMgr.clearOfflineObject(obj);
					}
				}
			})
		}

		/****************断线重连 专用方法*****************/
		//断线重连后发2张
		refapai2(vals: number[], create_fun: Handler, mainIdx: number, ownerIdx: number, count: number, unitCount: number) {
			for (let i = 0; i < vals.length; i++) {
				let card: MpniuniuData;
				card = create_fun.run();
				this._cards.push(card)
				card.Init(vals[i]);
				card.sortScore = 2 - i;
				card.myOwner(ownerIdx, mainIdx == ownerIdx, mainIdx, 3 + i);
				card && card.refapai();
			}
		}

		//断线重连，重新发牌(主玩家小牌)
		regaipai() {
			for (let i: number = 0; i < this._cards.length; i++) {
				let card = this._cards[i];
				if (!card) return;
				card.regaipai();
			}
		}

		//断线重连，重新发牌(主玩家大牌)
		refapai() {
			for (let i: number = 0; i < this._cards.length; i++) {
				let card = this._cards[i];
				if (!card) return;
				card.refapai();
			}
		}

		//翻牌(断线重连后)
		reloadFanpai() {
			let unitnum = this.getPlayerOnSeat();
			for (let i: number = 0; i < 5; i++) {
				let card: MpniuniuData;
				if (i < 3) {
					card = this._cards[i] as MpniuniuData;
				} else {
					card = this._cards[unitnum * 3 + (i - 3)] as MpniuniuData;
				}
				if (!card) return;
				card.fanpai();
			}
		}
	}
}