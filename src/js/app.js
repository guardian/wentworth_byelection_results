import { App } from './modules/applet'

function getURLParams(paramName) {

	const params = window.parent.location.search.substring(1).split("&")

    for (let i = 0; i < params.length; i++) {
    	let val = params[i].split("=");
	    if (val[0] == paramName) {
	        return val[1];
	    }
	}
	return null;

}

function loadData(url, data=null, type="GET") {

	return new Promise((resolve, reject) => {

		var xhr = new XMLHttpRequest();
		xhr.open(type, url, true);
		xhr.setRequestHeader("Content-type", "application/json");
		xhr.onreadystatechange = () => {

			if (xhr.readyState == 4 && xhr.status == 200) {
				resolve(JSON.parse(xhr.responseText))
			}

		}

		(data!=null) ? xhr.send(data) : xhr.send() ;

	})

}

const key = "13zZ1n2EQ5X675RL3FKoNFNdFXAQWXCxXRKOQx0x4M9w"

if ( key != null ) {

	loadData('https://interactive.guim.co.uk/docsdata/' + key + '.json').then( (resp) => {

		let googledoc = resp.sheets;

		new App(googledoc)


	}).catch((error) => {

		console.log(error)
            
    });

}





