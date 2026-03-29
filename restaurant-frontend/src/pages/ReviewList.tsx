import {Star, StarHalf, Star as StarOutline} from "lucide-react";
import {FC, useEffect, useState} from "react";
import axios from "axios";

export const restaurantIcons: { [key: string]: string } = {
    ristorante: "🍝",
    osteria: "🍷",
    trattoria: "🥖",
    sushi: "🍣",
    pizza: "🍕",
    trapizzino: "🥪",
    bowl: "🥗",
    orientale: "🍜",
    default: "🍽️"
};

const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 10 - full - half;

    return (
        <div className="flex items-center gap-1 mt-1">
            {[...Array(full)].map((_, i) => (
                <Star key={`f-${i}`} size={18} className="text-yellow-500 fill-yellow-500"/>
            ))}
            {half === 1 && <StarHalf size={18} className="text-yellow-500 fill-yellow-500"/>}
            {[...Array(empty)].map((_, i) => (
                <StarOutline key={`e-${i}`} size={18} className="text-gray-300"/>
            ))}
            <span className="ml-2 text-sm text-gray-600">({rating}/10)</span>
        </div>
    );
};

type ReviewAttributes = {
    id: number;
    userId: number;
    restaurantId: number;
    rating: number;
    comment: string;
    createdAt: string;
}

type Review = {
    review: ReviewAttributes;
    deletable: boolean;
};

type Restaurant = {
    name: string;
    type: string;
};

type User = {
    username: string;
};

type ReviewListProps = {
    loading: boolean;
    reviews: Review[];
    handleDelete: (reviewId: number) => Promise<void>;
    jwtToken: string;
};

const ReviewList: FC<ReviewListProps> = ({reviews, handleDelete, jwtToken}) => {
    const [restaurantData, setRestaurantData] = useState<Record<number, Restaurant>>({});
    const [userData, setUserData] = useState<Record<number, User>>({});

    useEffect(() => {
        const fetchRestaurantData = async () => {
            const uniqueIds = [...new Set(reviews.map((r) => r.review.restaurantId))];
            const results: Record<number, Restaurant> = {};

            await Promise.all(
                uniqueIds.map(async (id) => {
                    try {
                        const res = await axios.get(`/restaurant/restaurant/${id}`, {
                            headers: {
                                Authorization: `Bearer ${jwtToken}`,
                            },
                        });
                        results[id] = {
                            name: res.data.name,
                            type: res.data.type.toLowerCase(),
                        };
                    } catch (e) {
                        results[id] = {
                            name: `Ristorante #${id}`,
                            type: "default",
                        };
                    }
                })
            );

            setRestaurantData(results);
        };

        const fetchUserData = async () => {
            const uniqueIds = [...new Set(reviews.map((r) => r.review.userId))];
            const results: Record<number, User> = {};

            await Promise.all(
                uniqueIds.map(async (id) => {
                    try {
                        const res = await axios.get(`/users/user/${id}`, {
                            headers: {
                                Authorization: `Bearer ${jwtToken}`,
                            },
                        });
                        results[id] = {
                            username: res.data.username,
                        };
                    } catch (e) {
                        results[id] = {
                            username: `User #${id}`,
                        };
                    }
                })
            );

            setUserData(results);
        };

        //TODO: Improve rendering these data
        fetchRestaurantData();
        fetchUserData();
    }, [reviews, jwtToken]);

    return (
        <ul className="space-y-6 mx-auto px-4">
            {reviews.map((r) => {
                const restaurant = restaurantData[r.review.restaurantId];
                const icon = restaurant ? restaurantIcons[restaurant.type] || restaurantIcons.default : "🍽️";
                const restaurantName = restaurant ? restaurant.name : `Ristorante #${r.review.restaurantId}`;
                const user = userData[r.review.userId];
                const userName = user ? user.username : `User #${r.review.userId}`;

                return (
                    <li
                        key={r.review.id}
                        className="p-6 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="text-xl">{icon}</div>
                                <div className="text-lg font-semibold text-gray-900">{restaurantName}</div>
                            </div>

                            {r.deletable && (
                                <button
                                    onClick={() => handleDelete(r.review.id)}
                                    className="p-1 rounded-full bg-red-600 border border-red-700 hover:bg-red-700 transition-colors duration-150"
                                    title="Elimina recensione"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-4 h-4 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-3-3v3"
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>

                        <div className="text-sm text-gray-700 italic mb-3">
                            <span className="font-bold">{userName}</span>: “{r.review.comment}”
                        </div>

                        {renderStars(r.review.rating)}

                        <div className="mt-2 text-xs text-gray-500">
                            Pubblicato il: {new Date(r.review.createdAt).toLocaleString("it-IT", { timeZone: "UTC" })}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};

export default ReviewList;
