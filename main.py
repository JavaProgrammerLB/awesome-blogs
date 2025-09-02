def main():
    print("请输入博客主的名称：")
    name = input().strip()
    print("请输入博客网址：")
    url = input().strip()
    print("请输入博客主的介绍：")
    desc = input().strip()
    print("请输入播客主头像的url：")
    avatar = input().strip()

    line = f"1. [{name}]({url}) {desc}<br><img src=\"{avatar}\" width=\"300px\" height=\"auto\" alt=\"{name}\">\n"

    readme_path = "README.md"
    try:
        with open(readme_path, "a", encoding="utf-8") as f:
            f.write(line)
        print("博客信息已添加到README.md！")
    except Exception as e:
        print(f"写入README.md时出错: {e}")


if __name__ == "__main__":
    main()
