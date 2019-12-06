/**
* name 
*/
module gamempniuniu.page {
	export class MpniuniuPageDef extends game.gui.page.PageDef {
		static GAME_NAME: string;
		//牛牛界面
		static PAGE_NIUNIU: string = "1";
		//牛牛地图UI
		static PAGE_NIUNIU_MAP: string = "2";
		//牛牛开始游戏动画界面
		static PAGE_NIUNIU_BEGIN: string = "3";
		//牛牛胜利动画界面
		static PAGE_NIUNIU_WIN: string = "4";
		//牛牛失败动画界面
		static PAGE_NIUNIU_LOSE: string = "5";
		//牛牛游戏通杀界面
		static PAGE_NIUNIU_TONGSHA: string = "6";
		//牛牛游戏通赔界面
		static PAGE_NIUNIU_TONGPEI: string = "7";

		//牛牛游戏规则界面
		static PAGE_NIUNIU_RULE: string = "101";

		static myinit(str: string) {
			super.myinit(str);
			MpniuniuClip.init();
			PageDef._pageClassMap[MpniuniuPageDef.PAGE_NIUNIU] = MpniuniuPage;
			PageDef._pageClassMap[MpniuniuPageDef.PAGE_NIUNIU_MAP] = MpniuniuMapPage;
			PageDef._pageClassMap[MpniuniuPageDef.PAGE_NIUNIU_BEGIN] = MpniuniuBeginPage;
			PageDef._pageClassMap[MpniuniuPageDef.PAGE_NIUNIU_WIN] = MpniuniuWinPage;
			PageDef._pageClassMap[MpniuniuPageDef.PAGE_NIUNIU_LOSE] = MpniuniuLosePage;
			PageDef._pageClassMap[MpniuniuPageDef.PAGE_NIUNIU_RULE] = MpniuniuRulePage;
			PageDef._pageClassMap[MpniuniuPageDef.PAGE_NIUNIU_TONGSHA] = MpniuniuTongShaPage;
			PageDef._pageClassMap[MpniuniuPageDef.PAGE_NIUNIU_TONGPEI] = MpniuniuTongPeiPage;


			this["__needLoadAsset"] = [
				PathGameTongyong.atlas_game_ui_tongyong + "hud.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "pai.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "general.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "touxiang.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "qz.atlas",
				Path_game_mpniuniu.atlas_game_ui + "mpniuniu.atlas",
				DatingPath.atlas_dating_ui + "qifu.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "general/effect/suiji.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "general/effect/fapai_1.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "general/effect/xipai.atlas",
				Path_game_mpniuniu.ui_mpniuniu + "sk/mpnn_0.png",
				Path_game_mpniuniu.ui_mpniuniu + "sk/mpnn_1.png",
				Path_game_mpniuniu.ui_mpniuniu + "sk/mpnn_2.png",
				Path_game_mpniuniu.ui_mpniuniu + "sk/mpnn_3.png",

				PathGameTongyong.atlas_game_ui_tongyong + "dating.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "logo.atlas",
				Path.custom_atlas_scene + 'card.atlas',
				Path.map + 'pz_mpniuniu.png',
				Path.map_far + 'bg_mpniuniu.jpg',
			]

			if (WebConfig.needMusicPreload) {
				this["__needLoadAsset"] = this["__needLoadAsset"].concat([
					Path_game_mpniuniu.music_mpniuniu + "nn_bgm.mp3",
					Path_game_mpniuniu.music_mpniuniu + "gaipai.mp3",
					Path_game_mpniuniu.music_mpniuniu + "kaishi.mp3",
					Path_game_mpniuniu.music_mpniuniu + "niu0_1.mp3",
					Path_game_mpniuniu.music_mpniuniu + "niu0_2.mp3",
					Path_game_mpniuniu.music_mpniuniu + "niu1_1.mp3",
					Path_game_mpniuniu.music_mpniuniu + "niu1_2.mp3",
					Path_game_mpniuniu.music_mpniuniu + "niu2_1.mp3",
					Path_game_mpniuniu.music_mpniuniu + "niu2_2.mp3",
					Path_game_mpniuniu.music_mpniuniu + "niu3_1.mp3",
					Path_game_mpniuniu.music_mpniuniu + "niu3_2.mp3",
					Path_game_mpniuniu.music_mpniuniu + "niu4_1.mp3",
					Path_game_mpniuniu.music_mpniuniu + "niu4_2.mp3",
					Path_game_mpniuniu.music_mpniuniu + "niu5_1.mp3",
					Path_game_mpniuniu.music_mpniuniu + "niu5_2.mp3",
					Path_game_mpniuniu.music_mpniuniu + "niu6_1.mp3",
					Path_game_mpniuniu.music_mpniuniu + "niu6_2.mp3",
					Path_game_mpniuniu.music_mpniuniu + "niu7_1.mp3",
					Path_game_mpniuniu.music_mpniuniu + "niu7_2.mp3",
					Path_game_mpniuniu.music_mpniuniu + "niu8_1.mp3",
					Path_game_mpniuniu.music_mpniuniu + "niu8_2.mp3",
					Path_game_mpniuniu.music_mpniuniu + "niu9_1.mp3",
					Path_game_mpniuniu.music_mpniuniu + "niu9_2.mp3",
					Path_game_mpniuniu.music_mpniuniu + "niu10_1.mp3",
					Path_game_mpniuniu.music_mpniuniu + "niu10_2.mp3",
					Path_game_mpniuniu.music_mpniuniu + "niu11_1.mp3",
					Path_game_mpniuniu.music_mpniuniu + "niu11_2.mp3",
					Path_game_mpniuniu.music_mpniuniu + "niu12_1.mp3",
					Path_game_mpniuniu.music_mpniuniu + "niu12_2.mp3",
					Path_game_mpniuniu.music_mpniuniu + "niu13_1.mp3",
					Path_game_mpniuniu.music_mpniuniu + "niu13_2.mp3",
					Path_game_mpniuniu.music_mpniuniu + "niu14_1.mp3",
					Path_game_mpniuniu.music_mpniuniu + "niu14_2.mp3",
					Path_game_mpniuniu.music_mpniuniu + "piaoqian.mp3",
					Path_game_mpniuniu.music_mpniuniu + "shengli.mp3",
					Path_game_mpniuniu.music_mpniuniu + "shibai.mp3",
					Path_game_mpniuniu.music_mpniuniu + "suidao.mp3",
					Path_game_mpniuniu.music_mpniuniu + "suiji.mp3",
					Path_game_mpniuniu.music_mpniuniu + "zjtongchi.mp3",
				])
			}
		}
	}
}