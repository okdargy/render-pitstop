import { json, error } from "@sveltejs/kit";
import JSZip from 'jszip';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    let { assets, saveAsNames, profile } = await request.json();

    if (!assets) throw error(400, "No assets provided");

    if (assets.length <= 0) throw error(400, "No assets provided");

    if(!saveAsNames) saveAsNames = false;

    const zip = new JSZip();

    for(let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        let name = asset.id;
        
        if(saveAsNames) {
            fetch('https://api.brick-hill.com/v1/shop/' + asset.id).then(res => res.json()).then(res => {
                name = res.data.name
            }).catch(err => console.log(err));
        }

        if(asset.data.texture) {
            // https://api.brick-hill.com/v1/assets/get/assetId
            let imgurl = 'https://api.brick-hill.com/v1/assets/get/' + asset.data.texture.replace(/^\D+/g, '');

            const image = await (await fetch(imgurl)).arrayBuffer();
            zip.file(name + '.png', image);
        }

        if(asset.data.mesh) {
            // https://api.brick-hill.com/v1/assets/get/assetId
            let meshurl = 'https://api.brick-hill.com/v1/assets/get/' + asset.data.mesh.replace(/^\D+/g, '');

            const mesh = await (await fetch(meshurl)).arrayBuffer();
            zip.file(name + '.obj', mesh);
        }
    }
    
    let content = await zip.generateAsync({type:"uint8array"});
    const date = new Date(Date.now());

    // see FileSaver.js
    return new Response(
        content, {
        status: 200,
        headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachement; filename=${profile.username}-export-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.zip;`
        },
    });
}