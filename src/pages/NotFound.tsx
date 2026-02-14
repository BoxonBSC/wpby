import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="text-6xl mb-4">🧧</div>
        <h1 className="text-4xl font-display text-cny-gold mb-2">404</h1>
        <p className="text-muted-foreground mb-6">页面不存在</p>
        <Link
          to="/"
          className="px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          回到首页
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
