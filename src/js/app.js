import xr from 'xr';
import { App } from './modules/applet'

var key = "13zZ1n2EQ5X675RL3FKoNFNdFXAQWXCxXRKOQx0x4M9w"

xr.get('https://interactive.guim.co.uk/docsdata/' + key + '.json').then((resp) => {

	let googledoc = resp.data.sheets;

	new App(googledoc)
	
});





