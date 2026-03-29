import {FC, useEffect, useState} from "react";
import ReviewFormFields from "../types/ReviewFormFields.tsx";
import NewRestaurantForm from "../restaurant/NewRestaurantForm.tsx";
import {Button} from "@material-tailwind/react";
import * as React from "react";

interface ReviewFormProps {
    onSuccess: (newReview: any) => void;
}

const ReviewForm: FC<ReviewFormProps> = ({onSuccess}) => {
    const token = localStorage.getItem("token");
    const [mode, setMode] = useState<"review" | "newRestaurant">("review");
    const [submitting, setSubmitting] = useState(false);

    const [partialName, setPartialName] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 5

    const [newReview, setNewReview] = useState({
        restaurantId: "",
        rating: "",
        comment: "",
    });

    const [newRestaurant, setNewRestaurant] = useState({
        name: "",
        url: "",
        type: "RISTORANTE",
    });

    const fetchSuggestions = async (reset = false) => {
        if (partialName.length <= 1) return;
        const currentPage = reset ? 0 : page;
        try {
            const res = await fetch(`/restaurant/search?partialName=${partialName}&page=${currentPage}&pageSize=${pageSize}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();
            setHasMore(!data.last);
            setPage(currentPage + 1);
            setSuggestions(prev => reset ? data.content : [...prev, ...data.content]);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => {
            fetchSuggestions(true);
        }, 300);

        return () => clearTimeout(delay);
    }, [partialName]);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/reviews/create", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    restaurantId: Number(newReview.restaurantId),
                    rating: Number(newReview.rating),
                    comment: newReview.comment,
                }),
            });
            if (!res.ok) throw new Error("Errore nell'invio della recensione");
            const data = await res.json();
            onSuccess(data);
            setNewReview({restaurantId: "", rating: "", comment: ""});
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateRestaurant = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/restaurant/create", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newRestaurant),
            });
            if (!res.ok) throw new Error("Errore nella creazione del ristorante");
            const restaurant = await res.json();
            setMode("review");
            setPartialName(restaurant.name);
            setNewReview((prev) => ({...prev, restaurantId: restaurant.id.toString()}));
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={mode === "review" ? handleSubmitReview : handleCreateRestaurant}
            className="space-y-6 max-w-md mx-auto"
        >
            <h2 className="text-xl font-semibold text-gray-800 mb-12">
                {mode === "review" ? "Lascia una recensione" : "Nuovo ristorante"}
            </h2>

            {mode === "review" ? (
                <ReviewFormFields
                    partialName={partialName}
                    setPartialName={setPartialName}
                    newReview={newReview}
                    setNewReview={setNewReview}
                    fetchSuggestions={fetchSuggestions}
                    suggestions={suggestions}
                    hasMore={hasMore}
                    showDropdown={showDropdown}
                    setShowDropdown={setShowDropdown}
                    onCreateNew={() => setMode("newRestaurant")}
                />
            ) : (
                <NewRestaurantForm
                    newRestaurant={newRestaurant}
                    setNewRestaurant={setNewRestaurant}
                />
            )}

            <div className="flex justify-between">
                {mode === "newRestaurant" && (
                    <Button variant="text" color="gray"
                            onClick={() => setMode("review")} type="button" children="Annulla" className="p-0"
                            placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                    </Button>
                )}
                <Button type="submit" disabled={submitting}
                        children={submitting
                            ? "Invio in corso..."
                            : mode === "review"
                                ? "Invia recensione"
                                : "Crea ristorante"}
                        placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                </Button>
            </div>
        </form>
    );
};

export default ReviewForm;
