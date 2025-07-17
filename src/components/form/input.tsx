// import { useState } from 'react';
// import { get, RegisterOptions, useFormContext } from 'react-hook-form';
// import { IconType } from 'react-icons';
// import { HiEye, HiEyeOff } from 'react-icons/hi';

// import ErrorMessage from '@/components/form/ErrorMessage';
// import HelperText from '@/components/form/HelperText';
// import LabelText from '@/components/form/LabelText';
// import Typography from '@/components/Typography';
// import clsxm from '@/lib/clsxm';

// export type InputProps = {
//   id: string;
//   label?: string;
//   helperText?: React.ReactNode;
//   helperTextClassName?: string;
//   hideError?: boolean;
//   validation?: RegisterOptions;
//   prefix?: string;
//   suffix?: string;
//   rightIcon?: IconType;
//   leftIcon?: IconType;
//   rightIconClassName?: string;
//   leftIconClassName?: string;
// } & React.ComponentPropsWithoutRef<'input'>;

// export default function Input({
//   id,
//   label,
//   helperText,
//   hideError = false,
//   validation,
//   prefix,
//   suffix,
//   className,
//   type = 'text',
//   readOnly = false,
//   rightIcon: RightIcon,
//   leftIcon: LeftIcon,
//   rightIconClassName,
//   leftIconClassName,
//   helperTextClassName,
//   ...rest
// }: InputProps) {
//   const {
//     register,
//     formState: { errors },
//   } = useFormContext();

//   const [showPassword, setShowPassword] = useState(false);
//   const error = get(errors, id);

//   return (
//     <div className='w-full space-y-2'>
//       {label && (
//         <LabelText required={validation?.required ? true : false}>
//           {label}
//         </LabelText>
//       )}

//       <div className='relative flex w-full gap-0'>
//         <div
//           className={clsxm(
//             'pointer-events-none absolute h-full w-full rounded-md border-[#808080] ring-1 ring-inset ring-[#808080]',
//           )}
//         />

//         {prefix && (
//           <Typography
//             variant='c'
//             className='flex w-min items-center rounded-l-md border-r bg-[#F9FAFB] px-3 text-sm text-[#687083]'
//           >
//             {prefix}
//           </Typography>
//         )}

//         <div
//           className={clsxm(
//             'relative w-full rounded-md',
//             prefix && 'rounded-l-md',
//             suffix && 'rounded-r-md',
//           )}
//         >
//           {LeftIcon && (
//             <div
//               className={clsxm(
//                 'absolute left-0 top-0 h-full',
//                 'flex items-center justify-center pl-2.5',
//                 'text-lg text-neutral-100 md:text-xl',
//                 leftIconClassName,
//               )}
//             >
//               <LeftIcon />
//             </div>
//           )}

//           <input
//             {...register(id, validation)}
//             type={
//               type === 'password' ? (showPassword ? 'text' : 'password') : type
//             }
//             id={id}
//             name={id}
//             readOnly={readOnly}
//             disabled={readOnly}
//             className={clsxm(
//               'h-full w-full rounded-md border border-[#808080] px-3 py-2.5',
//               [LeftIcon && 'pl-9', RightIcon && 'pr-9'],
//               'focus:outline-1 focus:outline-primary-info-active focus:ring-inset',
//               'bg-neutral-10 text-sm',
//               'hover:ring-1 hover:ring-inset hover:ring-[#000]',
//               'placeholder:text-sm placeholder:text-[#9AA2B1] focus:placeholder:text-[#092540]',
//               error &&
//                 'bg-danger-border-2 border-none ring-2 ring-inset ring-danger-main placeholder:text-[#092540] focus:ring-danger-main',
//               prefix && 'rounded-l-none rounded-r-md ',
//               suffix && 'rounded-l-md rounded-r-none',
//               prefix && suffix && 'rounded-none',
//               readOnly && 'cursor-not-allowed',
//               className,
//             )}
//             aria-describedby={id}
//             {...rest}
//           />

//           {RightIcon && type !== 'password' && (
//             <div
//               className={clsxm(
//                 'absolute bottom-0 right-0 h-full',
//                 'flex items-center justify-center pr-2.5',
//                 'text-lg text-typo-outline-1 md:text-xl',
//                 rightIconClassName,
//               )}
//             >
//               <RightIcon />
//             </div>
//           )}

//           {type === 'password' && (
//             <div
//               className={clsxm(
//                 'absolute bottom-0 right-0 h-full',
//                 'flex items-center justify-center pr-3',
//                 'text-lg text-typo-outline-1 md:text-xl',
//                 'hover:cursor-pointer',
//                 rightIconClassName,
//               )}
//               onClick={() => setShowPassword(!showPassword)}
//             >
//               {showPassword ? <HiEye /> : <HiEyeOff />}
//             </div>
//           )}
//         </div>

//         {suffix && (
//           <Typography
//             variant='c'
//             className='flex w-min items-center rounded-r-md border-l bg-[#F9FAFB] px-3 text-sm text-[#687083]'
//           >
//             {suffix}
//           </Typography>
//         )}
//       </div>

//       {!hideError && error && <ErrorMessage>{error.message}</ErrorMessage>}
//       {helperText && (
//         <HelperText helperTextClassName={helperTextClassName}>
//           {helperText}
//         </HelperText>
//       )}
//     </div>
//   );
// }
