/**
* name 
*/
module gamempniuniu.page {
	const enum TYEP_INDEX {
		TYPE_WANFA_JIESHAO = 0,
		TYPE_CARD_LEIXING = 1,
		TYPE_CARD_DAXIAO = 2,
		TYPE_CARD_BEISHU = 3,
		TYPE_SETTLE_COUNT = 4,
	}
	export class MpniuniuRulePage extends game.gui.base.Page {
		private _viewUI: ui.ajqp.game_ui.mpniuniu.QiangZhuangNN_GuiZeUI;

		constructor(v: Game, onOpenFunc?: Function, onCloseFunc?: Function) {
			super(v, onOpenFunc, onCloseFunc);
			this._isNeedBlack = true;
			this._isClickBlack = true;
			this._asset = [
				Path_game_mpniuniu.atlas_game_ui + "mpniuniu.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "general.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "hud.atlas",
			];
		}

		// 页面初始化函数
		protected init(): void {
			this._viewUI = this.createView('game_ui.mpniuniu.QiangZhuangNN_GuiZeUI');
			this.addChild(this._viewUI);

		}

		// 页面打开时执行函数
		protected onOpen(): void {
			super.onOpen();
			this._viewUI.panel_jiesuan.vScrollBarSkin = "";
			this._viewUI.panel_jiesuan.vScrollBar.autoHide = true;
			this._viewUI.panel_jiesuan.vScrollBar.elasticDistance = 100;

			this._viewUI.btn_tab.selectHandler = Handler.create(this, this.selectHandler, null, false);
			if (this.dataSource) {
				this._viewUI.btn_tab.selectedIndex = this.dataSource;
			} else {
				this._viewUI.btn_tab.selectedIndex = TYEP_INDEX.TYPE_WANFA_JIESHAO;
			}
		}

		private selectHandler(index: number): void {
			this._viewUI.img_wanfa.visible = this._viewUI.btn_tab.selectedIndex == TYEP_INDEX.TYPE_WANFA_JIESHAO;
			this._viewUI.img_leixing.visible = this._viewUI.btn_tab.selectedIndex == TYEP_INDEX.TYPE_CARD_LEIXING;
			this._viewUI.panel_jiesuan.visible = this._viewUI.btn_tab.selectedIndex == TYEP_INDEX.TYPE_SETTLE_COUNT;
			this._viewUI.txt_daxiao.visible = this._viewUI.btn_tab.selectedIndex == TYEP_INDEX.TYPE_CARD_DAXIAO;
			this._viewUI.txt_beishu.visible = this._viewUI.btn_tab.selectedIndex == TYEP_INDEX.TYPE_CARD_BEISHU;
		}

		public close(): void {
			if (this._viewUI) {
				this._viewUI.btn_tab.selectedIndex = -1;
			}
			super.close();
		}
	}
}