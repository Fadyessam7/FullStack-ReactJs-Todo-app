import { useState } from "react";
import TodoSkeleton from "../components/TodoSkeleton";
import Paginator from "../components/ui/Paginator";
import useCustomQuery from "../hooks/useAuthenticatedQuery";
import { ITodo } from "../interfaces";

const TodosPage = () => {
  const storageKey = "loggedInUser";
  const userDataString = localStorage.getItem(storageKey);
  const userData = userDataString ? JSON.parse(userDataString) : null;

  const [page, setPage] = useState<number>(1);

  const { isLoading, data, isFetching } = useCustomQuery({
    queryKey: [`todo-page-${page}`],
    url: `/todos?pagination[pageSize]=25&pagination[page]=${page}`,
    config: {
      headers: {
        Authorization: `Bearer ${userData.jwt}`,
      },
    },
  });

  //** HANDLERS
  const onClickPrev = () => {
    setPage((prev) => prev - 1);
  };

  const onClickNext = () => {
    setPage((prev) => prev + 1);
  };

  if (isLoading)
    return (
      <div className="space-y-1">
        {Array.from({ length: 3 }, (_, index) => (
          <TodoSkeleton key={index}></TodoSkeleton>
        ))}
      </div>
    );
  return (
    <div className="mx-24">
      {" "}
      {data.data.length ? (
        data.data.reverse().map((todo: ITodo, index: number) => {
          return (
            <div
              key={todo.id}
              className="flex items-center justify-between hover:bg-gray-100 duration-300 p-3 rounded-md even:bg-gray-100"
            >
              <p className="w-full font-semibold">
                {todo.id} - {index + 1}- {todo.title}
              </p>
            </div>
          );
        })
      ) : (
        <h3>No Todos Yet!</h3>
      )}
      <div className="my-3">
        <Paginator
          page={page}
          pageCount={data.meta.pagination.pageCount}
          total={data.meta.pagination.total}
          isLoading={isLoading || isFetching}
          onClickPrev={onClickPrev}
          onClickNext={onClickNext}
        ></Paginator>
      </div>
    </div>
  );
};

export default TodosPage;
