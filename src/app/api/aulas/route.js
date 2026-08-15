import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function generateSecurePassword(length = 12) {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*(),.?:{}|<>';
    
    let password = '';
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    const allChars = lowercase + uppercase + numbers + symbols;
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    return password.split('').sort(() => 0.5 - Math.random()).join('');
}

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
            
            // Validar que el alumnoId sea un UUID válido (no "guest_user")
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!alumnoId || !uuidRegex.test(alumnoId)) {
                return NextResponse.json({ error: 'Debes estar registrado como alumno para unirte a un aula.' }, { status: 400 });
            }

            const { data: clase, error: errClase } = await supabase.from('clases').select('id, nombre_clase').ilike('codigo_invitacion', codigo.trim()).single();
            if (errClase) console.error('Error fetching clase:', errClase);
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

            const { data: claseInfo } = await adminClient.from('clases').select('profesor_id').eq('id', claseId).single();
            const profId = claseInfo?.profesor_id || null;

            console.log(">>> PROCESO GENERACIÓN:", { claseId, cantidad, alias });
            
            const created = [];
            const usersToCreate = [];

            if (alias) {
                usersToCreate.push({
                    email: `${alias.toLowerCase().replace(/\s+/g, '')}@dojoflow.edu`,
                    password: generateSecurePassword(12),
                    alias: alias
                });
            } else if (cantidad) {
                const prefix = `c${claseId.slice(0, 5)}`.toLowerCase();
                for (let i = 0; i < cantidad; i++) {
                    const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
                    const studentAlias = `${prefix}_${randomStr}_${i + 1}`;
                    usersToCreate.push({
                        email: `${studentAlias}@dojoflow.edu`,
                        password: generateSecurePassword(12),
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
                await adminClient.from('clase_alumnos').insert({ clase_id: claseId, alumno_id: uid, profesor_id: profId });
                
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
