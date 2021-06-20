import { useRouter } from 'next/router';
import Link, { LinkProps } from "next/link";
import { cloneElement, ReactElement } from "react";

interface ActiveLinkProps extends LinkProps {
    children: ReactElement;
    activeClassName: string;
}

export function ActiveLink({ children, activeClassName, ...rest }: ActiveLinkProps) {
    //Recuperando rota atual:
    const { asPath } = useRouter();

    //Estabelecendo qual link do menu estará ativo:
    const className = asPath === rest.href ? activeClassName : '';

    return(
        <Link {...rest}>
            {cloneElement(children, {
                className,
            })}
        </Link>
    );
}