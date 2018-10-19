import xr from 'xr';
import template from '../../templates/template.html'
//import Ractive from 'ractive'
Ractive.DEBUG = false;

const $ = selector => document.querySelector(selector)
const $$ = selector => [].slice.apply(document.querySelectorAll(selector))

export class App {

	constructor(googledoc) {

		var self = this

		this.timeout = 0

		this.candidates = googledoc.candidates

		this.prediction = googledoc.prediction[0].value

		this.incumbent = googledoc.prediction[1].value

		this.counting = (googledoc.prediction[2].value==='TRUE') ? true : false ;

		for (var i = 0; i < this.candidates.length; i++) {

			this.candidates[i].votes = ''
			this.candidates[i].percentage = ''
			this.candidates[i].candidate_id = +this.candidates[i].candidate_id

		}

		if (this.counting) {

			window.setInterval(() => self.livewire(), 30000);

		}

		this.database = {
        	prediction: self.prediction,
        	incumbent: self.incumbent,
        	counting: self.counting,
        	candidates: self.candidates,
        	chart: [],
        	partify: function(party) {
				return (party === 'ALP' || party === 'Labor') ? 'Labor' :
				(party === 'Unknown') ? 'Unknown' :
				(party === 'XEN' || party === 'NXT' || party === 'CA' || party === 'Centre Alliance') ? 'Centre Alliance' :
				(party === 'LIB') ? 'Liberal' :
				(party === 'PHON' || party === 'ONP') ? 'One Nation' :
				(party === 'GRN' || party === 'The Greens') ? 'The Greens' : 
				(party === 'LNP' || party === 'Liberal National') ? 'Liberal National' : 
				(party === 'LDP' || party === 'Liberal Democrats') ? 'Liberal Democrats' : 'Independent'
			},
			shortify: function(party) {
				return party.replace(/[ .,\/#!$%\^&\*;:{}=\-_`~()]/g,"").toLowerCase()
			},
			classify: function() {
				return (self.counting) ? '' : ' hide' ;
			}
        }

		this.ractivate()

	}

	ractivate() {

		var self = this

        this.ractive = new Ractive({
            el: '#electorate_container',
            data: self.database,
            template: template,
        })

        this.livewire()

        this.ractive.on( 'results', function ( context ) {

        	$("#electorate_dropdown").classList.toggle("hide");

        	$("#viewer").classList.toggle("hide");

        });

	}

    livewire() {

    	var self = this

    	console.log("Beep")

        xr.get('https://interactive.guim.co.uk/2018/10/aus-byelections/recentResults.json?t=' + new Date().getTime()).then((resp) => {

           	if (resp.status === 200) {

           		let timeout = +resp.data["22844"][0]

           		if (timeout > self.timeout) {

           			self.getResults(timeout)

           		} else {

           			self.loadGoogledoc()
           		}

           	}

        });
    }

    getResults(timestamp) {

    	var self = this

        xr.get('https://interactive.guim.co.uk/2018/10/aus-byelections/22844-' + timestamp + '.json').then((resp) => {

           	if (resp.status === 200) {

           		self.update(resp.data.divisions[0], timestamp)

           	}

        });
    }

    update(json, timestamp) {

    	var self = this

    	var candidates = json.candidates

		self.counted = Math.round( ( parseInt(json.votesCounted) / parseInt(json.enrollment) * 100 ) * 10 ) / 10

		for (let i = 0; i < self.database.candidates.length; i++) {

			let candidate = candidates.find( (item) => {

			    return item.candidate_id === self.database.candidates[i].candidate_id

			});

			if (candidate) {

				self.database.candidates[i].percentage = candidate.votesPercent

				self.database.candidates[i].votes = candidate.votesTotal

			}

		}

		self.database.candidates.sort( (a, b) => {

		    return b["votes"] - a["votes"]

		});

		var copy = JSON.parse(JSON.stringify(self.database.candidates))

		self.database.chart = copy.splice(0, 5)

		self.database.chart.sort( (a, b) => {

		    return b["percentage"] - a["percentage"]

		});


		self.timeout = timestamp

		self.loadGoogledoc()

    }

	loadGoogledoc() {

		var self = this
 
		xr.get('https://interactive.guim.co.uk/docsdata/13zZ1n2EQ5X675RL3FKoNFNdFXAQWXCxXRKOQx0x4M9w.json?t=' + new Date().getTime()).then((resp) => {

           	if (resp.status === 200) {

           		let googledoc = resp.data.sheets;

				self.database.prediction = googledoc.prediction[0].value

				self.database.counting = (googledoc.prediction[2].value==='TRUE') ? true : false ;

				self.ractive.set(self.database)

           	}

		});

	}


}