const URL = "https://geocode.xyz/";

const splitCSVAddress = addressText => addressText.split(",");

const validateAddress = address => address.length === 3;

const generateAddressObject = element => {
	const address = {};
	[address.street, address.number, address.city] = element;
	return address;
};

const formatUrlReq = address => `${URL}${address.street},${address.number}+${address.city}?json=1`;

const getClusterList = (assignments, adresses) => {
	const clustersList = [];
	assignments.forEach((c, i) => {
		if(clustersList[c] === undefined) {
			clustersList[c] = [];
		}
		clustersList[c].push(adresses[i]);
	});
	return clustersList;
}

const appendCluterslistHTML = (clustersList) => {
	clustersList.forEach((clusterElem, index) => {
		$("#clustersList").append(`<li id="cluster_${index}">Cluster ${index}`);
		$(`#cluster_${index}`).append(`<ul id="clusterUL_${index}"></ul>`);

		clusterElem.forEach(e => {
			const addresst = e["standard"]["addresst"];
			const stnumber = e["standard"]["stnumber"] == null ? 0 : e["standard"]["stnumber"];
			const confidence = e["standard"]["confidence"];
			$(`#clusterUL_${index}`).append(`<li>${addresst} ${stnumber} (${confidence})</li>`);
		});
		$("#clustersList").append(`</li>`);
	});
}

const processAddresses = () => {
	const addressesListText = $("#addressesList").val();
	const addressesList = addressesListText.split("\n");
	const addresses = addressesList.map(splitCSVAddress)
									.filter(validateAddress)
									.map(generateAddressObject);

	const urlReqs = addresses.map(formatUrlReq);
	console.log(urlReqs);

	const urlReqTimesPromise = urlReqs.map((urlReq, i) => {
		return new Promise(resolve => setTimeout(resolve, i * config.delay)).then(() => {
			console.log(`json call: ${urlReq}`);
			return $.getJSON(urlReq);
		});
	});

	Promise.allSettled(urlReqTimesPromise).then(res => {
		console.log("Settled");
		console.log(res);
		const validRes = res.filter(e => e.status === "fulfilled").map(e => e.value);
		console.log(validRes);
		var coords = validRes.map(data => [parseFloat(data.latt), parseFloat(data.longt)]);
		console.log(coords);
		var kmeans = new KMeans({
			canvas: document.getElementById('plot'),
			data: coords,
			k: config.clusters
		});

		const clustersList = getClusterList(kmeans.getAssignments(), validRes);
		console.log(clustersList);

		appendCluterslistHTML(clustersList);
	}).catch(error => {
		console.log("Error");
		console.log(error);
		alert(error.responseText);
	});
}