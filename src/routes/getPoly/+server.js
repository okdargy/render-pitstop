import { json, error } from "@sveltejs/kit";

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  const { id } = await request.json();

  if (!id) throw error(400, "No ID provided");

  if (isNaN(id)) throw error(400, "ID is not a number");

  if (parseInt(id) <= 0) throw error(400, "ID cannot be 0 or less");

  console.log('https://api.brick-hill.com/v1/assets/getPoly/1/' + id);
  const res = await fetch('https://api.brick-hill.com/v1/assets/getPoly/1/' + id).then(res => res.json());
  return json(res);
}