import axiosInstance from '@/util/axiosInstance';

export default async function handler(req, res) {
  try {
    console.log('[test-getServerSideProps] Starting test...');
    
    const language = 'en';
    const location = 'all';
    
    console.log('[test-getServerSideProps] Fetching with lang:', language, 'location:', location);
    
    const response = await axiosInstance.get(`/posts`, {
      params: { 
        lang: language,
        location: location !== 'all' ? location : undefined
      },
      timeout: 25000,
    });
    
    console.log('[test-getServerSideProps] Response received:', {
      hasResponse: !!response,
      type: typeof response,
      keys: response ? Object.keys(response) : [],
      hasFrontPagePosts: response?.frontPagePosts !== undefined,
      hasTrendingPosts: response?.trendingPosts !== undefined,
      frontPageCount: response?.frontPagePosts?.length || 0,
      trendingCount: response?.trendingPosts?.length || 0,
    });
    
    return res.status(200).json({
      success: true,
      response: {
        hasResponse: !!response,
        type: typeof response,
        keys: response ? Object.keys(response) : [],
        hasFrontPagePosts: response?.frontPagePosts !== undefined,
        hasTrendingPosts: response?.trendingPosts !== undefined,
        frontPageCount: response?.frontPagePosts?.length || 0,
        trendingCount: response?.trendingPosts?.length || 0,
        samplePost: response?.frontPagePosts?.[0] ? {
          id: response.frontPagePosts[0]._id,
          title: response.frontPagePosts[0].title?.substring(0, 50),
        } : null,
      },
    });
  } catch (error) {
    console.error('[test-getServerSideProps] Error:', {
      message: error.message,
      code: error.code,
      hasResponse: !!error.response,
      hasRequest: !!error.request,
      responseStatus: error.response?.status,
      responseData: error.response?.data,
    });
    
    return res.status(500).json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        hasResponse: !!error.response,
        hasRequest: !!error.request,
        responseStatus: error.response?.status,
        responseData: error.response?.data,
      },
    });
  }
}
