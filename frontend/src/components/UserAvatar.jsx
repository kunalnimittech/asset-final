import { useState } from "react";
import { UserRound } from "lucide-react";
import "./user-avatar.css";

/**
 * The signed-in user's picture: their profile photo (Google / Microsoft / Zoho)
 * when they have one, otherwise a default user icon.
 *
 * referrerPolicy="no-referrer" matters: Google's photo URLs
 * (lh3.googleusercontent.com) often refuse requests that carry a referrer,
 * which leaves a broken image. If the photo still fails, we fall back to the icon.
 */
export function UserAvatar({ user, size = 32 }) {
  const src = user?.image || null;
  // Remount on a new photo URL so a previous failure doesn't stick.
  return <AvatarInner key={src ?? "none"} src={src} name={user?.name} size={size} />;
}

function AvatarInner({ src, name, size }) {
  const [failed, setFailed] = useState(false);
  const showPhoto = src && !failed;

  return (
    <span className="user-avatar" style={{ width: size, height: size }} data-photo={showPhoto || undefined}>
      {showPhoto ? (
        <img src={src} alt={name ? `${name}'s profile photo` : "Profile photo"} referrerPolicy="no-referrer" onError={() => setFailed(true)} />
      ) : (
        <UserRound size={Math.round(size * 0.56)} strokeWidth={1.75} aria-label="Default profile picture" />
      )}
    </span>
  );
}
