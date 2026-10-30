import { COLORS, MODEL, WIDE_COLORS, getColor } from '@/config/product';

const fmt = new Intl.NumberFormat('en-US');

export function Details() {
  const wide = WIDE_COLORS.map((id) => getColor(id).name).join(' and ');
  return (
    <section id="details" className="details" aria-labelledby="details-title">
      <div className="wrap details__grid">
        <h2 id="details-title" className="h2">
          Details
        </h2>
        <dl className="specs">
          <div>
            <dt>Length</dt>
            <dd className="tabular">{MODEL.lengthMm} mm</dd>
          </div>
          <div>
            <dt>Height</dt>
            <dd>
              <span className="tabular">{MODEL.heightMm} mm</span>, ground to the top of the heel loop
            </dd>
          </div>
          <div>
            <dt>Width</dt>
            <dd>
              <span className="tabular">{MODEL.widthMm} mm</span> at the forefoot
            </dd>
          </div>
          <div>
            <dt>Upper</dt>
            <dd>Engineered knit with two fused overlays</dd>
          </div>
          <div>
            <dt>Closure</dt>
            <dd>Round laces, four reinforced eyelets a side, tongue loop</dd>
          </div>
          <div>
            <dt>Midsole</dt>
            <dd>One-piece foam with a rounded toe</dd>
          </div>
          <div>
            <dt>Colourways</dt>
            <dd>{COLORS.map((c) => c.name).join(', ')}</dd>
          </div>
          <div>
            <dt>Widths</dt>
            <dd>Regular in every colourway; Wide in {wide}</dd>
          </div>
        </dl>
        <div className="details__model">
          <h3 className="h3">About the 3D model</h3>
          <p>
            The shoe on this page is a scanned model rendered live in your browser: {fmt.format(MODEL.triangles)}{' '}
            triangles and three complete material sets, one per colourway, each with colour, surface-detail and
            roughness maps. It was compressed from 7.8 MB to 1.8 MB so it loads quickly on a phone.
          </p>
          <p className="details__credit">
            Model:{' '}
            <a href={MODEL.credit.sourceUrl} target="_blank" rel="noopener noreferrer">
              {MODEL.credit.title}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>{' '}
            by {MODEL.credit.author}, licensed{' '}
            <a href={MODEL.credit.licenseUrl} target="_blank" rel="noopener noreferrer">
              {MODEL.credit.license}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
