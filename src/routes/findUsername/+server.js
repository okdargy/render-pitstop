import { json, error } from "@sveltejs/kit";

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  const { name } = await request.json();

  if (!name) throw error(400, "No username provided");
 
  if(!/^[a-zA-Z0-9[\].,_-]{3,26}$/.test(name)) throw error(400, "Invalid username");

  const res = await fetch("https://api.brick-hill.com/v1/user/id?username=" + name).then(res => res.json());
  return json(res);
}
