	<script>
	import toast from "svelte-french-toast";

	let storage = {
		hasStorage: false,
		saveAsNames: false,
		id: 0,
		username: '',
		profileData: [],
		itemData: []
	};

	function downloadZip() {
		if(!storage.hasStorage) return toast.error("You must grab a user first!");

		toast.promise(new Promise(async (resolve, reject) => {
			let res = await fetch('/downloadZip', {
				method: 'POST',
				body: JSON.stringify({
					assets: storage.itemData,
					saveAsNames: storage.saveAsNames,
					profile: storage.profileData.profile
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			})

			if(!res.ok) return reject(res.statusText);

			let blob = await res.blob();
			var url = window.URL || window.webkitURL;
			let link = url.createObjectURL(blob);

				// generate anchor tag, click it for download and then remove it again
			let a = document.createElement("a");
			const date = new Date(Date.now());
			a.setAttribute("download", `${storage.profileData.profile.username}-export-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.zip`);
			a.setAttribute("href", link);
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			return resolve(res);
		}), {
			loading: "Downloading avatar...",
			success: "Successfully downloaded avatar!",
			error: "Failed to download avatar! Please try again.",
		}, {
			position: "bottom-center",
			style: 'border-radius: 200px; background: #e6e6e6'
		})
	}

	function getItemData(avatar) {
		return new Promise((resolve, reject) => {
			let allItems = [];

			// hats
			for(let i = 0; i < avatar.items.hats.length; i++) {
				if(avatar.items.hats[i] !== 0) allItems.push(avatar.items.hats[i]);
			}

			// face
			if(avatar.items.face !== 0) allItems.push(avatar.items.face);

			// tool
			if(avatar.items.tool !== 0) allItems.push(avatar.items.tool);

			// pants
			if(avatar.items.pants !== 0) allItems.push(avatar.items.pants);

			//shirt
			if(avatar.items.shirt !== 0) allItems.push(avatar.items.shirt);

			// figure
			if(avatar.items.figure !== 0) allItems.push(avatar.items.figure);

			// tshirt
			if(avatar.items.tshirt !== 0) allItems.push(avatar.items.tshirt);

			// head
			if(avatar.items.head !== 0) allItems.push(avatar.items.head);

			// clohting
			if(avatar.items.clothing) {
				for(let i = 0; i < avatar.items.clothing.length; i++) {
					if(avatar.items.clothing[i] !== 0) allItems.push(avatar.items.clothing[i]);
				}
			}

			allItems.forEach(i => {
				fetch('/getPoly', {
					method: 'POST',
					body: JSON.stringify({ 
						id: i
					}),
					headers: {
						'Content-Type': 'application/json'
					}
				}).then((res) => res.json())
				.then((data) => {
					if(!data.message && !data.error) {
						storage.itemData.push({
								id: i,
								data: data[0]
						});
					} else {
						allItems.splice(allItems.indexOf(i), 1);
						let msg = data.message || data.error.message;
						toast.error(`Item ${i} failed: ` + msg, {
							position: "bottom-center",
							style: 'border-radius: 200px; background: #c93c3c; color: white;'
						});
					}

					if(storage.itemData.length === allItems.length) {
						storage.itemData = storage.itemData; // fuck svelte
						resolve(storage.itemData);
					}
				}).catch((err) => {
					console.log(err)
					reject();
				})
			})
		})
	}

	function grabData() {
		if(!storage.id) return toast.error("Invalid user ID!");
		if(storage.id < 1) return toast.error("User ID cannot be less than 1!");

		toast.promise(
		new Promise((resolve, reject) => {
			fetch(`/getUser`, {
				method: 'POST',
				body: JSON.stringify({ 
					id: storage.id
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			})
			.then((res) => res.json())
			.then((data) => {
				if(data.message) return reject(data.message);
				if(data.error) return reject(data.error);

				if(!data.profile.error && !data.avatar.error) {
					storage.hasStorage = true;
					storage.profileData = data;

					toast.promise(getItemData(data.avatar),	{
						loading: "Grabbing textures and meshes",
						success: "Successfully loaded item data!",
						error: "Failed to grab items! Please try again.",
					}, {
						position: "bottom-center",
						style: 'border-radius: 200px; background: #e6e6e6'
					})
					return resolve(data);
				} else {
					return reject(data.profile.error.message);
				}
			})
			.catch((err) => {
				console.log(err);
				reject(err);
			});
		}),
		{
			loading: "Grabbing profile info...",
			success: "Successfully grabbed profile info!",
			error: "Failed to grab info! Please try again.",
		}, {
			position: "bottom-center",
			style: 'border-radius: 200px; background: #e6e6e6'
		}
		);
	}

	function grabUser() {
		if(!validateUsername(storage.username)) return toast.error("Invalid username!");

		toast.promise(
		new Promise((resolve, reject) => {
			fetch(`/findUsername`, {
				method: 'POST',
				body: JSON.stringify({ 
					name: storage.username
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			})
			.then((res) => res.json())
			.then((data) => {
				if(data.message) return reject(data.message);
				if(data.error) return reject(data.error.message);

				if(data.id) {
					storage.hasStorage = false;
					storage.id = data.id;
					storage.username = data.username;
					storage.itemData = [];
					storage.profileData = [];

					return resolve(grabData());
				}
			})
			.catch((err) => {
				console.log(err);
				reject(err);
			});
		}),
		{
			loading: "Grabbing user...",
			success: "Successfully grabbed user!",
			error: "Failed to grab username!"
		}, {
			position: "bottom-center",
			style: 'border-radius: 200px; background: #e6e6e6'
		}
		);
	}

	// ^[a-zA-Z0-9[\].,_-]{3,26}$
	function validateUsername(/** @type {string} */ user) {
		return /^[a-zA-Z0-9[\] .,_-]{3,26}$/.test(user);
	};
	</script>

	<svelte:head>
	<title>dargy | rendering pitstop</title>
	<meta name="description" content="rendering pitstop" />
	</svelte:head>

	<section>
	<div class="max-w-lg mx-auto mt-3">
	<div class="isolate -space-y-px rounded-md">
		<div class="mb-3 relative border border-gray-300 rounded-md px-3 py-2 focus-within:z-10 focus-within:ring-1 focus-within:ring-indigo-600 focus-within:border-indigo-600">
			<label for="username" class="block w-full text-xs font-medium text-gray-700">Username</label>
			<input bind:value={storage.username} name="username" id="username" class="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm" placeholder="Maxed1" />
			<div class="flex items-center mt-3">
				<input bind:checked={storage.saveAsNames} id="default-checkbox" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
				<label for="default-checkbox" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Save files as item name</label>
			</div>
		</div>

		<div class="grid place-items-center mt-4">
			<div class="flex">
				<button class="px-5 py-2 text-white rounded-md bg-indigo-600" on:click={grabUser}>Grab User</button>
			</div>
		</div>
	</div>
	{#if storage.hasStorage}
		<div class="max-w-lg mx-auto mt-3">
			<div class="grid place-items-center">
				<img src={"https://api.brick-hill.com/v1/thumbnails/single?type=1&id=" + storage.profileData.profile.id} alt="avatar" class="rounded-full w-64 h-64 border-2 p-5" />
				<button class="px-5 py-2 mt-4 text-white rounded-md bg-green-600" on:click={downloadZip}>Download as ZIP</button>
			</div>
		</div>
	<div class="max-w-lg mx-auto mt-3 gap-5">
		{#each storage.itemData as item}
			<div class="flex p-3 rounded-md shadow-md mb-2">
				<img src={"https://api.brick-hill.com/v1/thumbnails/single?type=2&id=" + item.id} alt="item" class="float-left w-24 h-24 border-2 p-5 shadow-lg" />
				<div class="my-auto space-x-1 mx-5">
					{#if item.data.mesh}
						<a href	={"https://api.brick-hill.com/v1/assets/get/" + item.data.mesh.replace(/^\D+/g, '')} target="_blank" class="px-5 py-2 text-white rounded-md bg-indigo-600">Mesh</a>
					{/if}
					{#if item.data.texture}
						<a href={"https://api.brick-hill.com/v1/assets/get/" + item.data.texture.replace(/^\D+/g, '')} target="_blank" class="px-5 py-2 text-white rounded-md bg-indigo-600">Texture</a>
					{/if}
				</div>
			</div>
		{/each}
	</div>
	{/if}
	</section>
