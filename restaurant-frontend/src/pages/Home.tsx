import {FC, useState, useEffect} from "react";
//import { useNavigate } from "react-router-dom";
import {Typography} from "@material-tailwind/react";
import ReviewList from "./ReviewList";
import ReviewForm from "./review/ReviewForm.tsx";
import {ChevronDown, Plus, X} from "lucide-react";

const Home: FC = () => {
    //const navigate = useNavigate(); //TODO: use to invoke user and restaurant services to get more info
    const [successMessage, setSuccessMessage] = useState("");
    const username = localStorage.getItem("username");
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const token = localStorage.getItem("token");
    const pageSize = 5;

    const fetchReviews = (page: number) => {
        fetch(`/reviews/?page=${page}&pageSize=${pageSize}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.content.length < pageSize) setHasMore(false);
                setReviews((prev) => [...prev, ...data.content]);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchReviews(0);
    }, []);

    const handleAddReview = (newReview: any) => {
        setReviews([newReview, ...reviews]);
        setShowForm(false);
        setSuccessMessage("Recensione aggiunta con successo!");
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchReviews(nextPage);
    };

    const handleDelete = async (reviewId: number) => {
        if (!confirm("Sei sicuro di voler eliminare questa recensione?")) return;
        try {
            const res = await fetch(`/reviews/review/${reviewId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            if (!res.ok) throw new Error("Errore durante l'eliminazione");
            setReviews(prev => prev.filter(r => r.review.id !== reviewId));
        } catch (err: any) {
            alert(err.message);
        }
    };


    return (
        <>
            <section>
                <div className="pt-8 pb-8 bg-base-200 min-h-screen">
                    <div className="p-6 container mx-auto pt-[5%]">
                        <Typography
                            variant="h4"
                            color="blue-gray"
                            className="text-2xl mb-6"
                            children={`Ciao ${username ?? ""}, le ultime recensioni:`}
                            placeholder={undefined}
                            onPointerEnterCapture={undefined}
                            onPointerLeaveCapture={undefined}
                        />

                        {token && <ReviewList loading={loading} reviews={reviews} handleDelete={handleDelete}
                                              jwtToken={token}/>}

                        {successMessage && (
                            <div className="mb-4 p-2 bg-green-200 text-green-800 rounded">
                                {successMessage}
                            </div>
                        )}

                        {hasMore && (
                            <div className="mt-6 flex justify-center">
                                <button
                                    onClick={handleLoadMore}
                                    className="flex items-center gap-2 text-gray-900 border border-gray-900 bg-white hover:bg-blue-50 font-medium py-2 px-6 rounded-full shadow-sm transition-all duration-200"
                                >
                                    <ChevronDown size={18}/>
                                    Carica altre recensioni
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => setShowForm(true)}
                            className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gray-900 hover:bg-blue-800 text-white shadow-lg"
                        >
                            <Plus size={24}/>
                        </button>

                        {showForm && (
                            <div
                                className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50">
                                <div className="bg-white p-6 rounded-lg max-w-lg w-full relative shadow-lg">
                                    <button
                                        onClick={() => setShowForm(false)}
                                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                                    >
                                        <X size={20}/>
                                    </button>
                                    <ReviewForm onSuccess={handleAddReview}/>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

            </section>
        </>
    );
};

export default Home;
