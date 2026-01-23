import Link from "next/link";
import { useRouter } from "next/router";

export default function Breadcrumb({
  breadcrumbCategory,
  breadcrumbPostTitle,
}) {
  const { asPath } = useRouter();
  const isCompanyRoute = asPath.includes("/company");
  return (
    <>
      <div className="breadcrumb-area">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="breadcrumb-content">
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link href="/">Home</Link>
                    </li>
                    {!isCompanyRoute && breadcrumbCategory && (
                      <li className="breadcrumb-item">
                        <Link href={`/category/${breadcrumbCategory?.id}`}>
                          {breadcrumbCategory?.name}
                        </Link>
                      </li>
                    )}

                    {breadcrumbPostTitle && (
                      <li
                        className="breadcrumb-item active"
                        aria-current="page"
                      >
                        {breadcrumbPostTitle}
                      </li>
                    )}
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
