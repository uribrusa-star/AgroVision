import type { SVGProps } from 'react';

export function AgroVisionLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="hsl(var(--primary))"
      {...props}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <path d="M12.5 15a6.2 6.2 0 0 0 4-10" />
      <path d="M11.5 9a6.2 6.2 0 0 1-4 10" />
    </svg>
  );
}

export function StrawberryIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M18.26 13.72c-1.46-3.8-2.92-7.6-1.59-9.82 2.22-3.68-2.61-5.1-4.66-2.6-2.06-2.5-6.89-1.08-4.67 2.6 1.33 2.22-.13 6.02-1.59 9.82-1.49 3.86.73 6.28 5.4 6.28 4.68 0 6.89-2.42 5.4-6.28Z"/>
            <path d="M16 6.5c-1-2-3-2.5-4-1"/>
            <path d="m14 2-2 2-2-2"/>
        </svg>
    )
}
