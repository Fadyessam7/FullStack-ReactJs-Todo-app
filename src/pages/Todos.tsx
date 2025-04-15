import { ChangeEvent, useState } from "react";
import TodoSkeleton from "../components/TodoSkeleton";
import Paginator from "../components/ui/Paginator";
import useCustomQuery from "../hooks/useAuthenticatedQuery";
import { ITodo } from "../interfaces";

const TodosPage = () => {
  const storageKey = "loggedInUser";
  const userDataString = localStorage.getItem(storageKey);
  const userData = userDataString ? JSON.parse(userDataString) : null;

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortBy, setSortBy] = useState<string>("DESC");

  const { isLoading, data, isFetching } = useCustomQuery({
    queryKey: [`todo-page-${page}`, `${pageSize}`, `${sortBy}`],
    url: `/todos?pagination[pageSize]=${pageSize}&pagination[page]=${page}&sort=createdAt:${sortBy}`,
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

  const onChangePageSizeHandler = (event: ChangeEvent<HTMLSelectElement>) => {
    setPageSize(+event.target.value);
  };

  const onChangeSortByHandler = (event: ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value);
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
      <div className="flex justify-end mb-5 space-x-2">
        <select
          className="outline-2 rounded-md px-4 py-2"
          value={sortBy}
          onChange={onChangeSortByHandler}
        >
          <option value="DESC">Latest</option>
          <option value="ASC">Oldest</option>
        </select>
        <select
          className="outline-2 rounded-md px-4 py-2"
          value={pageSize}
          onChange={onChangePageSizeHandler}
        >
          <option disabled>page size</option>
          <option value={10}>10</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>{" "}
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
