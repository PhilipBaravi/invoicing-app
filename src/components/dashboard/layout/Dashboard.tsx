import { FC, useState, useCallback } from "react";
import { useMediaQuery } from "react-responsive";
import GlobalContextMenu from "../GlobalContextMenu";
import MainContent from "./MainContent";
import ResizableChatLayout from "../dashboarddefault/aichatbot/ResizableChatLayout";
const Dashboard: FC = () => {
  const [isLargeSidebarOpen, setIsLargeSidebarOpen] = useState(false);

  const isLargeScreen = useMediaQuery({ query: "(min-width: 1024px)" });

  const toggleLargeSidebar = useCallback(() => {
    setIsLargeSidebarOpen((prev) => !prev);
  }, []);

  return (
    <>
      <ResizableChatLayout>
        {isLargeScreen ? (
          <GlobalContextMenu>
            <MainContent
              isLargeScreen={isLargeScreen}
              isLargeSidebarOpen={isLargeSidebarOpen}
              toggleLargeSidebar={toggleLargeSidebar}
            />
          </GlobalContextMenu>
        ) : (
          <MainContent
            isLargeScreen={isLargeScreen}
            isLargeSidebarOpen={isLargeSidebarOpen}
            toggleLargeSidebar={toggleLargeSidebar}
          />
        )}
      </ResizableChatLayout>
    </>
  );
};

export default Dashboard;
