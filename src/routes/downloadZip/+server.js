import { json, error } from "@sveltejs/kit";
import JSZip from 'jszip';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  const assets = await request.json();

    if (!assets) throw error(400, "No assets provided");

    if (assets.length <= 0) throw error(400, "No assets provided");

    const zip = new JSZip();

    for(let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        console.log(asset)

        if(asset.data.texture) {
            // https://api.brick-hill.com/v1/assets/get/assetId
            let imgurl = 'https://api.brick-hill.com/v1/assets/get/' + asset.data.texture.replace(/^\D+/g, '');

            const image = await (await fetch(imgurl)).arrayBuffer();
            zip.file(asset.id + '.png', image);
            console.log('zipping image')
        }

        if(asset.data.mesh) {
            // https://api.brick-hill.com/v1/assets/get/assetId
            let meshurl = 'https://api.brick-hill.com/v1/assets/get/' + asset.data.mesh.replace(/^\D+/g, '');

            const mesh = await (await fetch(meshurl)).arrayBuffer();
            zip.file(asset.id + '.obj', mesh);
            console.log('zipping mesh')
        }
    }
    
    let content = await zip.generateAsync({type:"uint8array"});
    // see FileSaver.js
    console.log("sending zip")
    return new Response(
        content, {
        status: 200,
        headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": "attachement; filename=dargy-export-" + Date.now() + ".zip"
        },
    });
}