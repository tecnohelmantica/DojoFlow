import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req) {
    try {
        const body = await req.json();
        const { action } = body;
        
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        if (action === 'vincular_recurso') {
            const { claseId, recursoId } = body;
            const { error } = await supabase.from('clase_recursos').insert({ clase_id: claseId, recurso_id: recursoId });
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        if (action === 'desvincular_recurso') {
            const { vinculacionId } = body;
            const { error } = await supabase.from('clase_recursos').delete().eq('id', vinculacionId);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        if (action === 'unirse_con_codigo') {
            const { codigo, alumnoId } = body;
            const { data: clase } = await supabase.from('clases').select('id, nombre_clase').ilike('codigo_invitacion', codigo.trim()).single();
            if (!clase) return NextResponse.json({ error: 'Codigo invalido' }, { status: 404 });
            const { error: insertError } = await supabase.from('clase_alumnos').insert({ clase_id: clase.id, alumno_id: alumnoId });
            
            if (insertError) {
                // Si ya está unido (error de clave duplicada), lo tratamos como éxito pero con mensaje
                if (insertError.code === '23505') {
                    return NextResponse.json({ success: true, clase, message: 'Ya estabas unido a esta clase.' });
                }
                throw insertError;
            }
            
            return NextResponse.json({ success: true, clase });
        }

        if (action === 'generar_alumnos_bulk') {
            if (!supabaseServiceKey) {
                return NextResponse.json({ error: 'Falta clave de servicio' }, { status: 500 });
            }
            
            const { claseId, cantidad, alias } = body;
            const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
                auth: { autoRefreshToken: false, persistSession: false }
            });

            console.log(">>> PROCESO GENERACIÓN:", { claseId, cantidad, alias });
            
            const created = [];
            const usersToCreate = [];

            if (alias) {
                usersToCreate.push({
                    email: `${alias.toLowerCase().replace(/\s+/g, '')}@dojoflow.edu`,
                    password: Math.random().toString(36).slice(-8),
                    alias: alias
                });
            } else if (cantidad) {
                const prefix = `c${claseId.slice(0, 5)}`.toLowerCase();
                for (let i = 0; i < cantidad; i++) {
                    const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
                    const studentAlias = `${prefix}_${randomStr}_${i + 1}`;
                    usersToCreate.push({
                        email: `${studentAlias}@dojoflow.edu`,
                        password: Math.random().toString(36).slice(-8),
                        alias: studentAlias
                    });
                }
            }

            for (const user of usersToCreate) {
                const { data: authData, error: authErr } = await adminClient.auth.admin.createUser({
                    email: user.email,
                    password: user.password,
                    email_confirm: true,
                    user_metadata: { alias: user.alias, role: 'alumno' }
                });

                if (authErr) {
                    console.error(">>> ERROR AUTH:", authErr.message);
                    continue;
                }
                
                const uid = authData.user.id;
                await adminClient.from('profiles').insert({ id: uid, alias: user.alias, role: 'alumno' });
                await adminClient.from('clase_alumnos').insert({ clase_id: claseId, alumno_id: uid });
                
                created.push({ id: uid, alias: user.alias, password: user.password });
            }

            return NextResponse.json({ success: true, created });
        }

        return NextResponse.json({ error: 'Accion no valida' }, { status: 400 });

    } catch (error) {
        console.error(">>> ERROR GENERAL API:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
