	<script>
	import toast from "svelte-french-toast";

	let storage = {
		hasStorage: false,
		id: 0,
		username: '',
		profileData: [],
		itemData: []
	};

	async function downloadGET() {
		toast.success("Successfully toasted!");
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
			console.log(allItems)

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
					if(data.error) return console.log(data.error.message);
					storage.itemData.push({
							id: i,
							data: data[0]
					});
					
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
				if(data.error) return reject(data.error.message);
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
				if(data.error) return reject(data.error.message);
				if(data.id) {
					storage.hasStorage = false;
					storage.id = data.id;
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
		return /^[a-zA-Z0-9[\].,_-]{3,26}$/.test(user);
	};
	</script>

	<svelte:head>
	<title>dargy | rendering pitstop</title>
	<meta name="description" content="rendering pitstop" />
	</svelte:head>

	<section>
	<div class="max-w-lg mx-auto mt-3">
		<div class="isolate -space-y-px rounded-md shadow-sm">
			<div class="relative border border-gray-300 rounded-md px-3 py-2 focus-within:z-10 focus-within:ring-1 focus-within:ring-indigo-600 focus-within:border-indigo-600">
			<label for="username" class="block w-full text-xs font-medium text-gray-700">Username</label>
			<input bind:value={storage.username} name="username" id="username" class="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm" placeholder="Maxed1" />
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
				<img src={"https://api.brick-hill.com/v1/thumbnails/single?type=1&id=" + storage.profileData.profile.id} alt="avatar" class="rounded-full w-64 h-64 border-2 p-5 shadow-lg" />
			</div>
		</div>
	<div class="max-w-lg mx-auto mt-4 gap-5">
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
