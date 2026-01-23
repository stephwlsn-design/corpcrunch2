/**
 * Script to inflate views and shares for all posts
 * Run this script to add inflated view and share counts to all articles
 * 
 * Usage: node scripts/inflate-views-shares.js
 */

const axios = require('axios');

const API_BASE_URL = 'https://recroot-next.vercel.app/api';

// Function to generate random inflated numbers
function getInflatedViews() {
  // Generate views between 100,000 and 5,000,000
  const min = 100000;
  const max = 5000000;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getInflatedShares() {
  // Generate shares between 100,000 and 5,000,000
  const min = 100000;
  const max = 5000000;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getAllPosts() {
  try {
    const response = await axios.get(`${API_BASE_URL}/posts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error.message);
    return null;
  }
}

async function inflatePostStats(postId, views, shares) {
  try {
    console.log(`Inflating post ${postId}: ${views.toLocaleString()} views, ${shares.toLocaleString()} shares`);
    
    // For very large numbers, we'll make batch requests in parallel
    // Use larger batches and process them more efficiently
    const batchSize = 500; // Process 500 at a time for better performance
    const viewBatches = Math.ceil(views / batchSize);
    const shareBatches = Math.ceil(shares / batchSize);
    
    // Process views in batches with parallel execution
    const viewPromises = [];
    for (let batch = 0; batch < viewBatches; batch++) {
      const currentBatchSize = Math.min(batchSize, views - (batch * batchSize));
      const batchPromises = [];
      
      for (let i = 0; i < currentBatchSize; i++) {
        batchPromises.push(
          axios.post(`${API_BASE_URL}/posts/${postId}/views`, {}, {
            timeout: 5000
          }).catch(() => {
            // Ignore individual errors
          })
        );
      }
      
      viewPromises.push(Promise.all(batchPromises));
      
      // Show progress every 50 batches
      if ((batch + 1) % 50 === 0) {
        const progress = Math.round(((batch + 1) / viewBatches) * 100);
        console.log(`  Views progress: ${progress}% (${(batch + 1) * batchSize} / ${views.toLocaleString()})`);
      }
    }
    
    // Process all view batches
    await Promise.all(viewPromises);
    console.log(`  ✓ Completed ${views.toLocaleString()} views`);
    
    // Process shares in batches with parallel execution
    const sharePromises = [];
    for (let batch = 0; batch < shareBatches; batch++) {
      const currentBatchSize = Math.min(batchSize, shares - (batch * batchSize));
      const batchPromises = [];
      
      for (let i = 0; i < currentBatchSize; i++) {
        batchPromises.push(
          axios.post(`${API_BASE_URL}/posts/${postId}/shares`, {}, {
            timeout: 5000
          }).catch(() => {
            // Ignore individual errors
          })
        );
      }
      
      sharePromises.push(Promise.all(batchPromises));
      
      // Show progress every 50 batches
      if ((batch + 1) % 50 === 0) {
        const progress = Math.round(((batch + 1) / shareBatches) * 100);
        console.log(`  Shares progress: ${progress}% (${(batch + 1) * batchSize} / ${shares.toLocaleString()})`);
      }
    }
    
    // Process all share batches
    await Promise.all(sharePromises);
    console.log(`  ✓ Completed ${shares.toLocaleString()} shares`);
    
    return true;
  } catch (error) {
    console.error(`Error inflating stats for post ${postId}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('Starting to inflate views and shares for all posts...\n');
  
  const postsData = await getAllPosts();
  
  if (!postsData) {
    console.error('Failed to fetch posts. Exiting.');
    process.exit(1);
  }
  
  // Get all posts from frontPagePosts and trendingPosts
  const allPosts = [
    ...(postsData.frontPagePosts || []),
    ...(postsData.trendingPosts || [])
  ];
  
  if (allPosts.length === 0) {
    console.log('No posts found. Exiting.');
    process.exit(0);
  }
  
  console.log(`Found ${allPosts.length} posts to process.\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const post of allPosts) {
    if (!post.id) continue;
    
    const views = getInflatedViews();
    const shares = getInflatedShares();
    
    const success = await inflatePostStats(post.id, views, shares);
    
    if (success) {
      successCount++;
      console.log(`✓ Post "${post.title}" - ${views} views, ${shares} shares`);
    } else {
      failCount++;
      console.log(`✗ Failed to inflate stats for post "${post.title}"`);
    }
    
    // Add a small delay between posts to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Successfully processed: ${successCount} posts`);
  console.log(`Failed: ${failCount} posts`);
  console.log(`Total posts: ${allPosts.length}`);
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { inflatePostStats, getAllPosts };

