import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { getDashboardPathByRole } from '../../../shared/utils/roles';

export const LoginForm = () => {
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password);
      toast.success('Inicio de sesión exitoso');
      navigate(getDashboardPathByRole(user.role));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-[20px] backdrop-saturate-[1.2] border border-white/10 rounded-[24px] px-6 sm:px-12 pt-10 sm:pt-12 pb-8 sm:pb-10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
      <h1 className="text-center font-['Playfair_Display',serif] text-2xl sm:text-[1.6rem] font-medium tracking-[0.35em] text-white/90 mb-8 sm:mb-10 uppercase">
        LOGIN BANK
      </h1>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Email Field */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="font-['Cormorant_Garamond',serif] text-base font-medium text-white/55 tracking-[0.03em]">
            Email
          </label>
          <div className="relative flex items-center">
            <input
              type="email"
              id="email"
              placeholder="correo@ejemplo.com"
              disabled={loading}
              className={`w-full py-[0.85rem] px-[1.1rem] bg-white/10 border-none rounded bg-transparent text-white/85 font-['Cormorant_Garamond',serif] text-base font-normal transition-colors duration-300 focus:outline-none focus:bg-white/15 placeholder:text-white/30 disabled:opacity-40 disabled:cursor-not-allowed ${errors.email ? 'border border-red-500/50 bg-red-500/5' : ''}`}
              {...register('email', { 
                required: 'El correo es requerido',
                pattern: { value: /^\S+@\S+$/i, message: 'Correo no válido' }
              })}
            />
          </div>
          {errors.email && (
            <span className="text-red-400 text-sm font-['Cormorant_Garamond',serif]">{errors.email.message}</span>
          )}
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="font-['Cormorant_Garamond',serif] text-base font-medium text-white/55 tracking-[0.03em]">
            Password
          </label>
          <div className="relative flex items-center">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="••••••••"
              disabled={loading}
              className={`w-full py-[0.85rem] px-[1.1rem] bg-white/10 border-none rounded bg-transparent text-white/85 font-['Cormorant_Garamond',serif] text-base font-normal transition-colors duration-300 focus:outline-none focus:bg-white/15 placeholder:text-white/30 disabled:opacity-40 disabled:cursor-not-allowed pr-10 ${errors.password ? 'border border-red-500/50 bg-red-500/5' : ''}`}
              {...register('password', { required: 'La contraseña es requerida' })}
            />
            <button
              type="button"
              className="absolute right-3 bg-transparent border-none text-white/45 text-[1.1rem] cursor-pointer p-1 transition-colors duration-200 hover:text-white/75"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? '◉' : '◎'}
            </button>
          </div>
          {errors.password && (
            <span className="text-red-400 text-sm font-['Cormorant_Garamond',serif]">{errors.password.message}</span>
          )}
        </div>

        {/* Options Row */}
        <div className="flex justify-between items-center mt-1">
          <label className="flex items-center gap-2 cursor-pointer font-['Cormorant_Garamond',serif] text-[0.95rem] text-white/50">
            <input 
              type="checkbox" 
              className="w-[15px] h-[15px] accent-white/60 cursor-pointer"
              {...register('rememberMe')}
            />
            <span>Recordarme siempre</span>
          </label>
          <a href="/forgot-password" className="font-['Cormorant_Garamond',serif] text-[0.95rem] text-white/50 no-underline transition-colors duration-200 hover:text-white/80">
            Olvidaste tu contraseña?
          </a>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          className="mt-5 w-[70%] sm:w-[55%] self-center py-[0.85rem] px-8 bg-white/5 border border-white/20 rounded-[10px] text-white/80 font-['Playfair_Display',serif] text-[0.95rem] font-medium tracking-[0.3em] uppercase cursor-pointer transition-all duration-350 hover:bg-white/10 hover:border-white/35 hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'ENTRANDO...' : 'ENTRAR'}
        </button>
      </form>

      <div className="text-center mt-7 font-['Cormorant_Garamond',serif] text-[0.95rem] text-white/35">
        <span>¿No tienes una cuenta? </span>
        <button 
          onClick={() => navigate('/register')}
          className="bg-transparent border-none text-white/60 font-semibold ml-1 transition-colors duration-200 hover:text-white/85 hover:underline cursor-pointer"
        >
          Registrarse aqui
        </button>
      </div>
    </div>
  );
};
