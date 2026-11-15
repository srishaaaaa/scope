import { Link } from 'react-router-dom';
import { Reveal } from '../Motion';

// One heading pattern for every section: small caps label above a serif title. `center` stacks them in the middle;
// otherwise the label sits left with an optional link on the right (the product-shelf pattern).
export default function SectionHead({ label, title, sub, center = false, link, id }) {
  return (
    <Reveal className={`s13-sh ${center ? 'c' : ''}`}>
      <div className="s13-sh-t">
        <p className="s13-label">{!center && <i aria-hidden="true" />}{label}</p>
        {title && <h2 id={id} className="s13-h2">{title}</h2>}
        {sub && <p className="s13-sub">{sub}</p>}
      </div>
      {link && <Link className="s13-link" to={link[0]} data-cursor="VIEW">{link[1]}</Link>}
    </Reveal>
  );
}
