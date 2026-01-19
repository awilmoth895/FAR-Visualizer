
import type { ReactNode } from 'react';
import './section.css';


interface Props {
    title: string
    description?: string
    children?: ReactNode
}

function Description({ description }: { description: string }) {
    return (
        <div className='description'>
            {description}
        </div>
    );
}

export default function Section(props: Props) {
    
    return (
        <div className="section">
            <h2 className="title">
                {props.title}
            </h2>
            {props.description && <Description description={props.description}/>}
            <div className="content-box">
                { props.children }
            </div>
        </div>
    );
}