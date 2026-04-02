import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchReviews } from '../features/reviews/reviewsSlice';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Star } from 'lucide-react';

const Reviews = () => {
  const dispatch = useDispatch();
  const { reviews, isLoading } = useSelector((state) => state.reviews);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchReviews());
  }, [dispatch]);

  if (isLoading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  const userReviews = reviews.filter(r => r.reviewerId === user?.id || r.revieweeId === user?.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Reviews</h1>

      {userReviews.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <Star size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No reviews yet</h3>
            <p className="text-gray-600">Complete some tasks to start getting reviews.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userReviews.map((review) => (
            <Card key={review.id}>
              <div className="flex items-center mb-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={20} 
                      className={`${
                        i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      } mr-1`}
                    />
                  ))}
                </div>
                <Badge variant="default" className="ml-auto">
                  {review.rating}/5
                </Badge>
              </div>
              <p className="text-gray-600 mb-4">{review.comment}</p>
              <div className="flex items-center text-sm text-gray-500">
                <span>Task #{review.taskId}</span>
                <span className="mx-2">•</span>
                <span>{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
