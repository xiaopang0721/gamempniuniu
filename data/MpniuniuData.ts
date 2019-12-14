/**
* name 
*/
module gamempniuniu.data {
	export class MpniuniuData extends gamecomponent.object.PlayingPoker {
		private _card_count: number = 0;
		private _isFan: boolean = false;
		private _ownerIdx: number;
		private _b: boolean;
		private _posList: any = [[430, 630, 110], [980, 390, 28], [780, 250, 28], [405, 250, 28], [220, 390, 28]];
		private _mainIdx: number;
		private _cardIdx: number;

		constructor() {
			super();
		}

		public Init(v: number) {
			if (v < 0 || v > 52) {
				throw "PlayingCard v < 0 || v > 52," + v
			}
			this._val = v - 1;
			this.time_interval = 350;
			this.Analyze();
		}

		protected Analyze(): void {
			this._card_val = this._val % 13 + 1;
			this._card_color = Math.floor(this._val / 13);
			if (this._card_val > 10)
				this._card_count = 10;
			else
				this._card_count = this._card_val;
			this._isFan = this._val < 0 ? false : true;
		}

		//获取牌的归属座位
		public GetOwnerIdx() {
			return this._ownerIdx;
		}

		//获取牛牛牌值
		public GetCount() {
			return this._card_count;
		}

		myOwner(v: number, b: boolean, index: number, cardIdx: number) {
			this._ownerIdx = v;
			this._b = b;
			this.size = 0.2;
			this._mainIdx = index;
			this._cardIdx = cardIdx;
			this.rotateAngle = Math.PI / 6;
			this.toggleDistance = 0;
		}

		fapai() {
			let idx = this._ownerIdx;
			let posIdx = (idx - this._mainIdx + 5) % 5;
			let posX = this._posList[posIdx][0];
			let posY = this._posList[posIdx][1];
			let space = this._posList[posIdx][2];
			if (!this.targe_pos) {
				this.targe_pos = new Vector2();
			}
			this.targe_pos.x = posX + this._cardIdx * space;
			this.targe_pos.y = posY;
			this.scaleX = -1;
			super.fapai();
			Laya.Tween.to(this, { size: this._b ? 1 : 0.65 }, this.time_interval);
			Laya.Tween.to(this, { rotateAngle: Math.PI * 4 }, this.time_interval);
		}

		refapai() {
			let idx = this._ownerIdx;
			let posIdx = (idx - this._mainIdx + 5) % 5;
			let posX = this._posList[posIdx][0];
			let posY = this._posList[posIdx][1];
			let space = this._posList[posIdx][2];
			if (!this.targe_pos) {
				this.targe_pos = new Vector2();
			}
			this.pos.x = posX + this._cardIdx * space;
			this.pos.y = posY;
			this.targe_pos.x = posX + this._cardIdx * space;
			this.targe_pos.y = posY;
			this.scaleX = -1;
			this.size = this._b ? 1 : 0.65;
			this.rotateAngle = Math.PI * 4;
			super.fapai();

		}

		regaipai() {
			let idx = this._ownerIdx;
			let posIdx = (idx - this._mainIdx + 5) % 5;
			let posX = posIdx == 0 ? 590 : this._posList[posIdx][0];
			let posY = posIdx == 0 ? 510 : this._posList[posIdx][1];
			let space = posIdx == 0 ? 28 : this._posList[posIdx][2];
			if (!this.targe_pos) {
				this.targe_pos = new Vector2();
			}
			this.isFinalPos = false;
			this.size = 0.65;
			this.pos.x = posX + this._cardIdx * space;
			this.pos.y = posY;
			this.targe_pos.x = posX + this._cardIdx * space;
			this.targe_pos.y = posY;
			this.scaleX = -1;
			this.rotateAngle = Math.PI * 4;
			super.fapai();
		}

		yipai() {
			if (!this.targe_pos) {
				this.targe_pos = new Vector2();
			}
			this.toggleEnable = false;
			this.isFinalPos = false;
			this.targe_pos.x = 590 + this._cardIdx * 28;
			this.targe_pos.y = 510;
			this.size = 0.65;
			if(!this.pos) return;
			Laya.Tween.to(this.pos, { x: this.targe_pos.x, y: this.targe_pos.y }, this.time_interval);
		}

		fanpai() {
			if (!this._isFan) return;
			super.fanpai();
		}

		gaipai() {
			super.gaipai();
		}

		moveCard() {
			this.isFinalPos = false;
			super.movePai();
		}
	}
}