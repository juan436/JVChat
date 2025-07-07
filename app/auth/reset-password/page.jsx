'use client'
import React, { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import asApi from '@/apiAxios/asApi';
import { useSnackMessages } from '@/hooks/useSnackMessage';
import FormResetPassword from '@/components/form/FormResetPassword';

function ResetPasswordContent() {
    const reactHookForm = useForm();
    const { msgMostrar } = useSnackMessages();
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const onSubmit = async (form) => {
        if (form.newPassword !== form.confirmNewPassword) {
            msgMostrar('Las contraseñas no coinciden', 'error');
            return;
        }

        try {
            const { data } = await asApi({
                url: '/auth/reset-password',
                method: 'POST',
                data: { token, newPassword: form.newPassword }
            });

            msgMostrar(data.message, 'success');
            router.push('/auth/login');
        } catch (error) {
            msgMostrar('Error al restablecer la contraseña: ' + (error.response?.data || error.message), 'error');
        }
    };

    return (
        <FormResetPassword reactHookForm={reactHookForm} onSubmit={onSubmit} />
    );
}

function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-slate-900">
            <div className="flex space-x-2">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.2}s` }}
                    ></div>
                ))}
            </div>
        </div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}

export default ResetPasswordPage;