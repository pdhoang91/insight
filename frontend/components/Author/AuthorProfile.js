// components/Author/AuthorProfile.js
import React from 'react';
import Link from 'next/link';
import { 
  FaGithub, 
  FaTwitter, 
  FaLinkedin, 
  FaEnvelope, 
  FaGlobe, 
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaEdit,
  FaUsers
} from 'react-icons/fa';

const AuthorProfile = ({ 
  author, 
  showFullBio = false, 
  showStats = true, 
  showFollowButton = true,
  className = '' 
}) => {
  // Default author data - in real app, this would come from props/API
  const authorData = author || {
    id: 1,
    name: "Your Name",
    username: "yourname",
    bio: "Software developer passionate about technology, writing, and sharing knowledge through code and words. I love exploring new technologies and building meaningful products.",
    fullBio: `I'm a software developer with over 5 years of experience in web development, 
    specializing in React, Node.js, and modern web technologies. 
    
    When I'm not coding, you can find me writing about technology, contributing to open source projects, 
    or exploring new frameworks and tools. I believe in the power of sharing knowledge and helping 
    others grow in their development journey.
    
    I'm currently working on several exciting projects and always open to interesting collaborations.`,
    avatar: "/images/author-avatar.jpg", // placeholder
    location: "Ho Chi Minh City, Vietnam",
    website: "https://yourwebsite.com",
    joinedDate: "2020-01-15",
    social: {
      github: "https://github.com/yourusername",
      twitter: "https://twitter.com/yourusername",
      linkedin: "https://linkedin.com/in/yourusername",
      email: "your.email@example.com"
    },
    stats: {
      posts: 42,
      followers: 1250,
      following: 180
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className={` rounded-lg border border-medium-border overflow-hidden ${className}`}>
      {/* Cover/Header Section */}
      <div className="h-24 bg-gradient-to-r from-medium-accent-green/10 to-medium-accent-green/5"></div>
      
      {/* Profile Content */}
      <div className="px-6 pb-6 -mt-12 relative">
        {/* Avatar */}
        <div className="flex justify-center mb-4">
          {authorData.avatar ? (
            <img
              src={authorData.avatar}
              alt={authorData.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-medium-bg-card shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 bg-medium-accent-green rounded-full flex items-center justify-center border-4 border-medium-bg-card shadow-lg">
              <span className="text-3xl font-serif font-bold text-white">
                {authorData.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Name & Username */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-serif font-bold text-medium-text-primary mb-1">
            {authorData?.name || 'Unknown Author'}
          </h2>
          <p className="text-medium-text-muted">@{authorData?.username || 'unknown'}</p>
        </div>

        {/* Bio */}
        <div className="text-center mb-6">
          <p className="text-medium-text-secondary leading-relaxed">
            {showFullBio ? (authorData?.fullBio || authorData?.bio) : authorData?.bio}
          </p>
          
          {!showFullBio && authorData?.fullBio && (
            <Link 
              href={`/${authorData?.username}`}
              className="text-medium-accent-green hover:underline text-sm mt-2 inline-block"
            >
              Read more
            </Link>
          )}
        </div>

        {/* Location & Website */}
        <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm text-medium-text-muted">
          {authorData.location && (
            <div className="flex items-center space-x-1">
              <FaMapMarkerAlt className="w-3 h-3" />
              <span>{authorData?.location}</span>
            </div>
          )}
          
          {authorData?.website && (
            <a
              href={authorData?.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 hover:text-medium-accent-green transition-colors"
            >
              <FaGlobe className="w-3 h-3" />
              <span>Website</span>
            </a>
          )}
          
          <div className="flex items-center space-x-1">
            <FaCalendarAlt className="w-3 h-3" />
            <span>Joined {formatDate(authorData?.joinedDate)}</span>
          </div>
        </div>

        {/* Stats */}
        {showStats && authorData?.stats && (
          <div className="flex justify-center space-x-8 mb-6 py-4 border-t border-b border-medium-divider">
            <div className="text-center">
              <div className="text-xl font-bold text-medium-text-primary">
                {authorData.stats?.posts || 0}
              </div>
              <div className="text-sm text-medium-text-muted">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-medium-text-primary">
                {(authorData.stats?.followers || 0).toLocaleString()}
              </div>
              <div className="text-sm text-medium-text-muted">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-medium-text-primary">
                {(authorData.stats?.following || 0).toLocaleString()}
              </div>
              <div className="text-sm text-medium-text-muted">Following</div>
            </div>
          </div>
        )}

        {/* Social Links */}
        <div className="flex justify-center space-x-4 mb-6">
          {authorData?.social?.github && (
            <a
              href={authorData.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-medium-bg-secondary hover:bg-medium-accent-green hover:text-white rounded-full transition-colors"
              aria-label="GitHub"
            >
              <FaGithub className="w-5 h-5" />
            </a>
          )}
          
          {authorData?.social?.twitter && (
            <a
              href={authorData?.social?.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-medium-bg-secondary hover:bg-medium-accent-green hover:text-white rounded-full transition-colors"
              aria-label="Twitter"
            >
              <FaTwitter className="w-5 h-5" />
            </a>
          )}
          
          {authorData?.social?.linkedin && (
            <a
              href={authorData?.social?.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-medium-bg-secondary hover:bg-medium-accent-green hover:text-white rounded-full transition-colors"
              aria-label="LinkedIn"
            >
              <FaLinkedin className="w-5 h-5" />
            </a>
          )}
          
          {authorData?.social?.email && (
            <a
              href={`mailto:${authorData?.social?.email}`}
              className="p-3 bg-medium-bg-secondary hover:bg-medium-accent-green hover:text-white rounded-full transition-colors"
              aria-label="Email"
            >
              <FaEnvelope className="w-5 h-5" />
            </a>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {showFollowButton && (
            <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-medium-accent-green text-white rounded-full font-medium hover:bg-medium-accent-green/90 transition-colors">
              <FaUsers className="w-4 h-4" />
              <span>Follow</span>
            </button>
          )}
          
          <Link
            href={`/${authorData.username}`}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-medium-border text-medium-text-secondary hover:border-medium-accent-green hover:text-medium-accent-green rounded-full font-medium transition-colors"
          >
            <FaEdit className="w-4 h-4" />
            <span>View Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthorProfile;
