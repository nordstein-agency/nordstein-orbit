import { NextResponse } from "next/server";
import { getOneAdmin } from "@/lib/supabase/one";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(){
    const one = getOneAdmin();

    const {data, error} = await one
        .from("users")
        .select("*")
        .limit(100);

    if(error){
        return NextResponse.json({error: error.message}, {status:500});
    }

    return NextResponse.json({users: data});
}