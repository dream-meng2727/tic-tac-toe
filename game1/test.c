#define _CRT_SECURE_NO_WARNINGS

#include"game.h"

void menu()
{
	printf("*************************\n");
	printf("********* 1.play *********\n");
	printf("********* 0.exit *********\n");
	printf("*************************\n");
}

void game()
{
	char ret = 0;
	char board[ROW][COL] = { 0 };
	//初始化棋盘
	InitBoard(board, ROW, COL);
	//打印棋盘
	DisplayBoard(board,ROW,COL);
	//下棋
	while (1)
	{
		//玩家下棋
		PlayerMove(board,ROW,COL);
		//判断输赢
		ret = IsWin(board, ROW, COL);
		if (ret != 'C')
		{
			break;
		}

		//打印棋盘
		DisplayBoard(board, ROW, COL);
		//电脑下棋
		ComputerMove(board,ROW,COL);
		//判断输赢
		ret = IsWin(board, ROW, COL);
		if (ret != 'C')
		{
			break;
		}

		//打印棋盘
		DisplayBoard(board, ROW, COL);

	}
	DisplayBoard(board, ROW, COL);
	if (ret == '*')
	{
		printf("恭喜你，获胜了！\n");
	}
	else if (ret == '#')
	{
		printf("很遗憾，你输了！\n");
	}
	else
	{
		printf("平局！\n");
	}
}

int main()
{
	srand((unsigned)time(NULL));//设置随机数生成的起点
	int input=0;
	do 
	{
		menu();//打印菜单
		printf("请选择:");
		scanf("%d", &input);
		switch (input)
		{
		case 1:
				game();//开始游戏
				break;
		case 0:
				printf("退出游戏\n");
				break;
		default:
				printf("输入错误，请重新输入\n");
				break;
		}
	} while (input);
	return 0;
}